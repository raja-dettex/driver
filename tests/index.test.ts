import axios, { AxiosError } from 'axios';
import fs from 'fs';

axios.interceptors.request.use(request => { 
    console.log(request.method, request.url)
    console.log(request.headers)
    return request
})
describe('presignedUrls', () => {
  beforeAll(() => {
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
    fs.writeFileSync('./temp/hello.txt', 'hello there');
  });

  it('user will be able to upload using presigned urls', async () => {
    try {
      const response = await axios.get('http://localhost:3000/urls/hello.txt');
      const {urls} = response.data;
      console.log(urls);

      const filePath = './temp/hello.txt';
      const fileStream = fs.createReadStream(filePath); 
        const length = fs.statSync(filePath).size;
      console.log("before upload");

      const res = await axios.put(urls[0], fileStream, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": length
        },
        maxBodyLength: Infinity, 
      });

      console.log("here"); 
      console.log(res.data);
      expect(res.status).toBe(200);

      const readres = await axios.get(urls[1], {
        responseType: 'blob'
      });

      console.log(typeof readres.data);
      console.log(readres.data);
      expect(readres.status).toBe(200);
      fs.writeFileSync('./output.txt', readres.data)
    } catch (error) {
      if (error instanceof AxiosError) console.log(error.response?.data);
      if (error instanceof Error) console.log(error.message);
    }
  });
});
