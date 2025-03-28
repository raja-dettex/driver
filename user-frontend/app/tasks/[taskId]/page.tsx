"use client";

import { useAuth } from "@/app/contexts/userContext";
import axios from "axios";
import { useEffect, useState } from "react";

interface Task {
  count: number;
  option: { imageUrl: string };
}

export default function TaskComponent() {
  const [title, setTitle] = useState("");
  const { state } = useAuth();
  console.log(state);

  let { token, currentTaskId } = state;
  if (token === "") {
    token = localStorage.getItem("token") ?? "";
  }

  const [currentTask, setCurrentTask] = useState<Record<string, Task>>({});

  useEffect(() => {
    console.log("token", token);
    getCurrrentTask(token, currentTaskId.toString())
      .then((res) => {
        setCurrentTask(res.result);
        setTitle(res.taskDetails.title);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{title || "Task Details"}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Object.entries(currentTask).map(([key, value]) => (
            <TaskRow key={Number(key)} count={value.count} imageUrl={value.option.imageUrl} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ count, imageUrl }: { count: number; imageUrl: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
      <img
        src={imageUrl}
        alt="Task Image"
        className="w-full h-48 object-cover rounded-lg border border-gray-300"
        onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
      />
      <p className="mt-2 text-gray-700 text-lg font-medium">Count: {count}</p>
    </div>
  );
}

const getCurrrentTask = async (token: string, taskId: string) => {
  console.log("taskId", taskId);
  try {
    const res = await axios.get(`http://localhost:3000/v1/users/task?taskId=${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
