import Image from "next/image";
import NavBar from "./components/Navbar";
import { FileUpload } from "./components/UploadFile";
import { Hero } from "./components/Hero";

export default function Home() {
  return (
    <div >
      <NavBar/>
      <hr />
      <Hero/>
      <FileUpload/>
    </div>
  );
}
