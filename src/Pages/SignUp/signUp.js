import React, { useState } from 'react'
import './signUp.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [uploadedImageUrl, setUploadedImageUrl] = useState("https://th.bing.com/th/id/OIP.RAdrPNRMbet9JG-EzVBh1gAAAA?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3");
  const [signeUpField, setsigneUpField] = useState({
    channelName: "", userName: "", password: "", about: "", profilePic: uploadedImageUrl
  });

  const handleInputField = (event, name) => {
    setsigneUpField({ ...signeUpField, [name]: event.target.value });
  };

  const uploadImage = async (e) => {
    const files = e.target.files;
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'youtube-clone');
    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dwoqk0yue/image/upload", data);
      const imageUrl = response.data.url;
      setUploadedImageUrl(imageUrl);
      setsigneUpField({ ...signeUpField, profilePic: imageUrl });
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Handle SignUp button click
  const handleSignUp = () => {
    if (!signeUpField.channelName || !signeUpField.userName || !signeUpField.password) {
      alert("Please fill in all required fields!");
      return;
    }

    // ✅ Save user info to localStorage
    localStorage.setItem("username", signeUpField.channelName);
    localStorage.setItem("userName", signeUpField.userName);
    localStorage.setItem("profilePic", signeUpField.profilePic);

    alert("SignUp Successful!");
    navigate('/'); // redirect to home
  };

  return (
    <div className='signUp'>
      <div className="signup_card">
        <div className="signUp_title">
          <AccountCircleIcon sx={{ fontSize: "54px" }} className='login_youtubeImage' />
          SignUp
        </div>

        <div className="signUp_Inputs">
          <input type="text" className='signUp_Inputs_inp' value={signeUpField.channelName} onChange={(e) => handleInputField(e, "channelName")} placeholder='Channel Name' />
          <input type="text" className='signUp_Inputs_inp' value={signeUpField.userName} onChange={(e) => handleInputField(e, "userName")} placeholder='User Name' />
          <input type="password" className='signUp_Inputs_inp' value={signeUpField.password} onChange={(e) => handleInputField(e, "password")} placeholder='Password' />
          <input type="text" className='signUp_Inputs_inp' value={signeUpField.about} onChange={(e) => handleInputField(e, "about")} placeholder='About Your Channel Name' />

          <div className="image_upload_signup">
            <input type='file' onChange={(e) => uploadImage(e)} />
            <div className="image_upload_signup_div">
              <img className='image_default_signup' src={uploadedImageUrl} alt="Profile Preview" />
            </div>
          </div>

          <div className="signUpBtns">
            {/* ✅ onClick added to SignUp button */}
            <div className="signUpBtn" onClick={handleSignUp}>SignUp</div>
            <Link to={'/'} className="signUpBtn">Home Page</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;