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

// 👇 Add this Error Boundary
import React from "react";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: "red", fontSize: 18 }}>
          <h2>💥 App Crashed!</h2>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [sideNavbar, setSideNavbar] = useState(false);
  const setSideNavbarFunc = (value) => setSideNavbar(value);

  return (
    <ErrorBoundary>
      <div className="App">
        <Navbar setSideNavbarFunc={setSideNavbarFunc} sideNavbar={sideNavbar} />
        <Routes>
          <Route path="/" element={<Home sideNavbar={sideNavbar} />} />
          <Route path="/video/:id" element={<Video />} />
          <Route path="/user/:id" element={<Profile sideNavbar={sideNavbar} />} />
          <Route path="/:id/upload" element={<VideoUpload />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/profile/:username" element={<Profile sideNavbar={sideNavbar} />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;