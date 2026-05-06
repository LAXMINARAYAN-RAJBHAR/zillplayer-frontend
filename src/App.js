import "./App.css";
import Navbar from "./Component/Navbar/navbar";
import Home from "./Pages/Home/home";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Video from "./Pages/Video/video";
import Profile from "./Pages/Profile/profile";
import VideoUpload from "./Pages/VideoUpload/videoUpload";
import SignUp from "./Pages/SignUp/signUp";
import Reels from "./Component/Reels/reels";


function App() {
  const [sideNavbar, setSideNavbar] = useState(false);

  const setSideNavbarFunc = (value) => {
    setSideNavbar(value);
  };

  return (
    <div className="App">
      <Navbar setSideNavbarFunc={setSideNavbarFunc} sideNavbar={sideNavbar} />
      <Routes>
        <Route path="/" element={<Home sideNavbar={sideNavbar} />} />
        <Route path="/video/:id" element={<Video />} />  {/* ✅ only this one */}
        <Route path="/user/:id" element={<Profile sideNavbar={sideNavbar} />} />
        <Route path="/:id/upload" element={<VideoUpload />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/profile/:username" element={<Profile sideNavbar={sideNavbar} />} />
      </Routes>
    </div>
  );
}

export default App;