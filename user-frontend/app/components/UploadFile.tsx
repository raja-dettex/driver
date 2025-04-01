"use client"
import { useState, useEffect } from "react";
import { getPresignedPutUrl, submitTask, upload } from "../lib/client";
import { useAuth } from "../contexts/userContext";
import { useRouter } from "next/navigation";
export function FileUpload() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const { state, dispatch } = useAuth();
  
  useEffect(() => {
    if (state.token) setToken(state.token);
  }, [state.token]);
  
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const urls = await Promise.all(
      files.map(async (f) => {
        
        const urls = await getPresignedPutUrl(f.name, token ?? "");
        if (urls !== null) {
          const { putUrl, getUrl } = urls;
          await upload(putUrl,  f, f.type);
          return { imageUrl: getUrl };
        }
      })
    );
    try {
      const options = urls.filter((o) => o !== undefined);
      const task = await submitTask(token ?? "", { options, title, signature: "438478343323" });
      console.log("task ", task);
      if(task) {
        localStorage.setItem('currentTaskId', String(task.id));
         dispatch({type: 'SET_TASK_ID', payload: { ...state, currentTaskId: task.id}})
        router.push(`/tasks/${task.id}`)
      } 
    } catch (err) {}
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Upload Files</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Title</label>
        <input
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter title here..."
        />
      </div>

      <label className="flex flex-col items-center p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer text-center">
        <span className="text-gray-500">Click to upload files</span>
        <input type="file" multiple className="hidden" onChange={handleFileChange} />
      </label>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Uploaded Files:</h3>
          <ul className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 p-2 rounded-lg">
            {files.map((file, index) => (
              <li key={index} className="p-2 bg-gray-100 rounded-lg border border-gray-300 flex justify-between items-center">
                <span className="text-gray-800">{file.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={(e) => handleUpload(e)}
        className="mt-4 w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-all"
      >
        Submit Task
      </button>
    </div>
  );
}
