import React, { useState } from "react";
import "./navbar.css";
import ListIcon from "@mui/icons-material/List";
import MyLogo from "../../assests/mylogo.png";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { Link, useNavigate } from "react-router-dom";
import Login from "../Login/login";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import YouTubeIcon from "@mui/icons-material/YouTube";

const Navbar = ({ setSideNavbarFunc, sideNavbar }) => {
  const [userPic] = useState(
    "https://athenabpo.com/wp-content/uploads/2016/09/Headshot-Blank-Person-Circle-300x300.gif",
  );
  const [navbarModal, setNavbarModal] = useState(false);
  const [login, setLogin] = useState(false);
  const navigate = useNavigate();

  const sideNavbarFunc = () => {
    setSideNavbarFunc(!sideNavbar);
  };

  const handleprofile = () => {
    navigate("/user/7697");
    setNavbarModal(false);
  };

  const setLoginModal = () => {
    setLogin(false);
  };

  const onclickOfPopUpOption = (button) => {
    setNavbarModal(false);

    if (button === "login") {
      setLogin(true);
    } else {
    }
  };

  return (
    <div className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <div className="navbarHamberger" onClick={sideNavbarFunc}>
          <ListIcon sx={{ color: "white" }} />
        </div>

        <Link to="/" className="navbar-logo-link">
          <img src={MyLogo} alt="App Logo" className="mylogo" />
          <span
            className="logoText"
            onClick={() => {
              const base =
                window.location.origin + window.location.pathname + "#/";
              if (window.location.href === base) {
                window.location.reload(); // already on home, just reload
              } else {
                window.location.href = base; // navigate to home (acts as reload)
              }
            }}
          >
            {"RollamRoll".split("").map((char, i) => (
              <span
                key={i}
                className="logoChar"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {char}
              </span>
            ))}
          </span>
        </Link>
      </div>

      {/* MIDDLE */}
      <div className="navbar-middle">
        <div className="navbar_searchBox">
          <input
            type="text"
            placeholder="Search"
            className="navbar_searchBoxInput"
          />
          <div className="navbar_searchIconBox">
            <SearchIcon sx={{ fontSize: "28px" }} />
          </div>
        </div>
        <div className="navbar_mike">
          <KeyboardVoiceIcon sx={{ color: "white" }} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        
        {/* ADD HERE ✅ */}
        <Link to="/youtube">
          <YouTubeIcon
            sx={{ fontSize: "30px", cursor: "pointer", color: "red" }}
          />
        </Link>

        <Link to={"/reels"}>
          <VideoLibraryIcon
            sx={{ fontSize: "30px", cursor: "pointer", color: "white" }}
          />
        </Link>

        <Link to={"/763/upload"}>
          <VideoCameraFrontIcon
            sx={{ fontSize: "30px", cursor: "pointer", color: "white" }}
          />
        </Link>

        <NotificationsActiveIcon
          sx={{ fontSize: "30px", cursor: "pointer", color: "white" }}
        />
        <img
          onClick={() => setNavbarModal((prev) => !prev)}
          src={userPic}
          alt="User"
          className="navbar-right-logo"
        />
        {navbarModal && (
          <div className="navbar-modal">
            <div className="navbar-modal-option" onClick={handleprofile}>
              Profile
            </div>
            <div
              className="navbar-modal-option"
              onClick={() => onclickOfPopUpOption("logout")}
            >
              Logout
            </div>
            <div
              className="navbar-modal-option"
              onClick={() => onclickOfPopUpOption("login")}
            >
              Login
            </div>
          </div>
        )}
      </div>

      {login && <Login setLoginModal={setLoginModal} />}
    </div>
  );
};

export default Navbar;
