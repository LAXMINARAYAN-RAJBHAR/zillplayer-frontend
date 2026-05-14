import React, { useState, useEffect } from "react";
import "./homePage.css";
import { reelsData } from "../Reels/reels";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_KEYS = [
  process.env.REACT_APP_YOUTUBE_KEY_1,
  process.env.REACT_APP_YOUTUBE_KEY_2,
  process.env.REACT_APP_YOUTUBE_KEY_3,
  process.env.REACT_APP_YOUTUBE_KEY_4,
  process.env.REACT_APP_YOUTUBE_KEY_5,
  process.env.REACT_APP_YOUTUBE_KEY_6,
];
let currentKeyIndex = 0;

const videos = [
  {
    id: 7679,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu-l3JR0guZspKsBZkVoakjkQ-qxUCCpkQnw&s",
    title: "Big Buck Bunny open-source film",
    duration: "09:56",
    channel: "Gangeshwary",
    tags: ["Film Criticisms", "Live"],
  },
  {
    id: 2,
    thumbnail: "https://i.ytimg.com/vi/ScMzIvxBSi4/hqdefault.jpg",
    title: "Sample Video 2",
    duration: "30:00",
    channel: "Mummy",
    tags: ["Music"],
  },
  {
    id: 3,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwyNTbTLzlbDj6RSQdV6imNyxNywT3pchKKg&s",
    title: "3d Lion Stock Photo",
    duration: "60:00",
    channel: "Papa",
    tags: ["AI"],
  },
  {
    id: 4,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpWv_QvC-7P4_8Ubbg2rwn0Om4APOgf6B3yA&s",
    title: "Sample Video 4",
    duration: "10:00",
    channel: "Karthik",
    tags: ["News"],
  },
  {
    id: 5,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZleDiTkppd2k7GVmREMQRs8D8JBbNXuuxUA&s",
    title: "8k Wallpaper 3d Photos",
    duration: "18:00",
    channel: "Annu",
    tags: ["Astronomy"],
  },
  {
    id: 6,
    thumbnail:
      "https://damassets.autodesk.net/content/dam/autodesk/www/industry/3d-animation/create-beautiful-3d-animations-thumb-1204x677.jpg",
    title: "3D Animation Solutions",
    duration: "08:00",
    channel: "Jyoti",
    tags: ["AI", "Web Development"],
  },
  {
    id: 7,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMxQZtpZz8NgMYzzNMiBm-n4h2oGYovjK2lQ&s",
    title: "3D Shapes | Types & Examples",
    duration: "28:00",
    channel: "Sarita",
    tags: ["Web Development"],
  },
  {
    id: 8,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK5izd-jLAR_UjqnUULPW42Pv_LIpL0W60cQ&s",
    title: "3d Graphics Pictures",
    duration: "20:00",
    channel: "Jaynarayan",
    tags: ["AI"],
  },
  {
    id: 9,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN6EQg2_-8zTqUk1YRvLpJinJk67VF0wEZfg&s",
    title: "Scenery 3d wallpaper",
    duration: "10:00",
    channel: "Shyamnarayan",
    tags: ["Astronomy"],
  },
  {
    id: 10,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS5r-8k6FyUEN9OYQu5WgyyNqT8lrqgw7dCQ&s",
    title: "3D Nature Images",
    duration: "12:00",
    channel: "Rajbhar",
    tags: ["History"],
  },
  {
    id: 11,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeUzhAtZL9ElXiENfplVjR5dCJsUQUG2NuXg&s",
    title: "5,364,800+ 3d Images",
    duration: "13:30",
    channel: "Narayan",
    tags: ["AI"],
  },
  {
    id: 12,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdcK3NWfTM_cOjFOH6ArcBdUbu29e0AVjFZw&s",
    title: "Understanding 3D Computer Graphics",
    duration: "20:50",
    channel: "Laxminarayan",
    tags: ["Web Development", "AI"],
  },
  {
    id: 13,
    thumbnail: "https://picsum.photos/seed/lion1/320/180",
    title: "3D Lion Stock Photo",
    duration: "60:00",
    channel: "Papa",
    tags: ["Film Criticisms"],
  },
  {
    id: 14,
    thumbnail: "https://picsum.photos/seed/tiger2/320/180",
    title: "Tiger in Wild",
    duration: "45:00",
    channel: "NatureTV",
    tags: ["History"],
  },
  {
    id: 15,
    thumbnail: "https://picsum.photos/seed/forest3/320/180",
    title: "Forest Walk",
    duration: "30:00",
    channel: "EcoWorld",
    tags: ["Live"],
  },
  {
    id: 16,
    thumbnail: "https://picsum.photos/seed/ocean4/320/180",
    title: "Ocean Waves",
    duration: "15:00",
    channel: "SeaLife",
    tags: ["Live"],
  },
  {
    id: 17,
    thumbnail: "https://picsum.photos/seed/mountain5/320/180",
    title: "Mountain Trek",
    duration: "20:00",
    channel: "Adventures",
    tags: ["Live"],
  },
  {
    id: 18,
    thumbnail: "https://picsum.photos/seed/city6/320/180",
    title: "City Lights",
    duration: "10:00",
    channel: "UrbanVibe",
    tags: ["News"],
  },
  {
    id: 19,
    thumbnail: "https://picsum.photos/seed/sunset7/320/180",
    title: "Sunset Timelapse",
    duration: "05:00",
    channel: "SkyWatch",
    tags: ["Astronomy"],
  },
  {
    id: 20,
    thumbnail: "https://picsum.photos/seed/beach8/320/180",
    title: "Beach Day",
    duration: "12:00",
    channel: "SummerFun",
    tags: ["Live"],
  },
  {
    id: 21,
    thumbnail: "https://picsum.photos/seed/rain9/320/180",
    title: "Rainy Day",
    duration: "08:00",
    channel: "Chill",
    tags: ["Music"],
  },
  {
    id: 22,
    thumbnail: "https://picsum.photos/seed/snow10/320/180",
    title: "Snowfall",
    duration: "25:00",
    channel: "WinterMood",
    tags: ["Live"],
  },
  {
    id: 23,
    thumbnail: "https://picsum.photos/seed/car11/320/180",
    title: "Sports Car Review",
    duration: "18:00",
    channel: "AutoDrive",
    tags: ["News"],
  },
  {
    id: 24,
    thumbnail: "https://picsum.photos/seed/food12/320/180",
    title: "Pasta Recipe",
    duration: "22:00",
    channel: "ChefLife",
    tags: ["Mixes"],
  },
  {
    id: 25,
    thumbnail: "https://picsum.photos/seed/tech13/320/180",
    title: "Latest Gadgets",
    duration: "35:00",
    channel: "TechZone",
    tags: ["AI", "Web Development"],
  },
  {
    id: 26,
    thumbnail: "https://picsum.photos/seed/space14/320/180",
    title: "Space Exploration",
    duration: "40:00",
    channel: "NASAFan",
    tags: ["Astronomy"],
  },
  {
    id: 27,
    thumbnail: "https://picsum.photos/seed/dog15/320/180",
    title: "Cute Dogs Compilation",
    duration: "14:00",
    channel: "PetPals",
    tags: ["Comedy"],
  },
  {
    id: 28,
    thumbnail: "https://picsum.photos/seed/cat16/320/180",
    title: "Funny Cats",
    duration: "11:00",
    channel: "MeowTime",
    tags: ["Comedy"],
  },
  {
    id: 29,
    thumbnail: "https://picsum.photos/seed/workout17/320/180",
    title: "Morning Workout",
    duration: "28:00",
    channel: "FitLife",
    tags: ["Live"],
  },
  {
    id: 30,
    thumbnail: "https://picsum.photos/seed/yoga18/320/180",
    title: "Yoga for Beginners",
    duration: "45:00",
    channel: "ZenMode",
    tags: ["Live"],
  },
  {
    id: 31,
    thumbnail: "https://picsum.photos/seed/music19/320/180",
    title: "Lo-Fi Music Mix",
    duration: "60:00",
    channel: "LoFiBeats",
    tags: ["Music", "Mixes"],
  },
  {
    id: 32,
    thumbnail: "https://picsum.photos/seed/travel20/320/180",
    title: "Travel Vlog: Japan",
    duration: "55:00",
    channel: "GlobeTrotter",
    tags: ["Live"],
  },
  {
    id: 33,
    thumbnail: "https://picsum.photos/seed/art21/320/180",
    title: "Painting Tutorial",
    duration: "50:00",
    channel: "ArtStudio",
    tags: ["Mixes"],
  },
  {
    id: 34,
    thumbnail: "https://picsum.photos/seed/code22/320/180",
    title: "Learn JavaScript",
    duration: "90:00",
    channel: "DevHQ",
    tags: ["Web Development"],
  },
  {
    id: 35,
    thumbnail: "https://picsum.photos/seed/bird23/320/180",
    title: "Birds of Paradise",
    duration: "16:00",
    channel: "WildBirds",
    tags: ["History"],
  },
  {
    id: 36,
    thumbnail: "https://picsum.photos/seed/river24/320/180",
    title: "River Kayaking",
    duration: "32:00",
    channel: "OutdoorX",
    tags: ["Live"],
  },
  {
    id: 37,
    thumbnail: "https://picsum.photos/seed/night25/320/180",
    title: "Night Sky Photography",
    duration: "38:00",
    channel: "StarGazer",
    tags: ["Astronomy"],
  },
  {
    id: 38,
    thumbnail: "https://picsum.photos/seed/coffee26/320/180",
    title: "Coffee Art Tips",
    duration: "09:00",
    channel: "BrewMaster",
    tags: ["Mixes"],
  },
  {
    id: 39,
    thumbnail: "https://picsum.photos/seed/book27/320/180",
    title: "Book Review",
    duration: "20:00",
    channel: "ReadMore",
    tags: ["History"],
  },
  {
    id: 40,
    thumbnail: "https://picsum.photos/seed/game28/320/180",
    title: "Gaming Highlights",
    duration: "42:00",
    channel: "ProGamer",
    tags: ["Gaming"],
  },
  {
    id: 41,
    thumbnail: "https://picsum.photos/seed/drone29/320/180",
    title: "Drone Footage",
    duration: "17:00",
    channel: "SkyView",
    tags: ["Astronomy"],
  },
  {
    id: 42,
    thumbnail: "https://picsum.photos/seed/history30/320/180",
    title: "Ancient Civilizations",
    duration: "65:00",
    channel: "HistoryBuff",
    tags: ["History"],
  },
  {
    id: 43,
    thumbnail: "https://picsum.photos/seed/garden31/320/180",
    title: "Garden Tips",
    duration: "23:00",
    channel: "GreenThumb",
    tags: ["Live"],
  },
  {
    id: 44,
    thumbnail: "https://picsum.photos/seed/fish32/320/180",
    title: "Deep Sea Creatures",
    duration: "44:00",
    channel: "OceanDepth",
    tags: ["History"],
  },
  {
    id: 45,
    thumbnail: "https://picsum.photos/seed/bike33/320/180",
    title: "Mountain Biking",
    duration: "31:00",
    channel: "BikePro",
    tags: ["Live"],
  },
  {
    id: 46,
    thumbnail: "https://picsum.photos/seed/sky34/320/180",
    title: "Cloud Formations",
    duration: "07:00",
    channel: "WeatherNerd",
    tags: ["Astronomy"],
  },
  {
    id: 47,
    thumbnail: "https://picsum.photos/seed/market35/320/180",
    title: "Street Market Tour",
    duration: "27:00",
    channel: "FoodieWalks",
    tags: ["DD News"],
  },
  {
    id: 48,
    thumbnail: "https://picsum.photos/seed/dance36/320/180",
    title: "Dance Choreography",
    duration: "13:00",
    channel: "DanceFloor",
    tags: ["Indian Music", "Music"],
  },
  {
    id: 49,
    thumbnail: "https://picsum.photos/seed/photo37/320/180",
    title: "Photography Masterclass",
    duration: "75:00",
    channel: "LensCraft",
    tags: ["Mixes"],
  },
  {
    id: 50,
    thumbnail: "https://picsum.photos/seed/desk38/320/180",
    title: "Desk Setup Tour",
    duration: "19:00",
    channel: "SetupGoals",
    tags: ["Web Development"],
  },
  {
    id: 51,
    thumbnail: "https://picsum.photos/seed/swim39/320/180",
    title: "Swimming Tips",
    duration: "36:00",
    channel: "AquaLife",
    tags: ["Live"],
  },
  {
    id: 52,
    thumbnail: "https://picsum.photos/seed/volcano40/320/180",
    title: "Volcanic Eruption",
    duration: "48:00",
    channel: "GeoWatch",
    tags: ["Astronomy", "News"],
  },
  {
    id: 53,
    thumbnail: "https://picsum.photos/seed/farm41/320/180",
    title: "Farm Life Vlog",
    duration: "53:00",
    channel: "RuralDays",
    tags: ["DD News"],
  },
  {
    id: 54,
    thumbnail: "https://picsum.photos/seed/robot42/320/180",
    title: "AI & Robotics",
    duration: "58:00",
    channel: "FutureTech",
    tags: ["AI"],
  },
  {
    id: 55,
    thumbnail: "https://picsum.photos/seed/horse43/320/180",
    title: "Horse Riding Basics",
    duration: "41:00",
    channel: "EquineLife",
    tags: ["Live"],
  },
  {
    id: 56,
    thumbnail: "https://picsum.photos/seed/dessert44/320/180",
    title: "Chocolate Cake Recipe",
    duration: "26:00",
    channel: "SweetBakes",
    tags: ["Mixes"],
  },
  {
    id: 57,
    thumbnail: "https://picsum.photos/seed/waterfall45/320/180",
    title: "Waterfall Hike",
    duration: "33:00",
    channel: "NatureWalks",
    tags: ["Live"],
  },
  {
    id: 58,
    thumbnail: "https://picsum.photos/seed/candle46/320/180",
    title: "DIY Candle Making",
    duration: "21:00",
    channel: "CraftCorner",
    tags: ["Mixes"],
  },
  {
    id: 59,
    thumbnail: "https://picsum.photos/seed/castle47/320/180",
    title: "Castle Exploration",
    duration: "67:00",
    channel: "HistoricPlaces",
    tags: ["History"],
  },
  {
    id: 60,
    thumbnail: "https://picsum.photos/seed/surf48/320/180",
    title: "Surfing Lessons",
    duration: "29:00",
    channel: "WaveRider",
    tags: ["Live"],
  },
  {
    id: 61,
    thumbnail: "https://picsum.photos/seed/jungle49/320/180",
    title: "Jungle Safari",
    duration: "72:00",
    channel: "WildExplorer",
    tags: ["History"],
  },
  {
    id: 62,
    thumbnail: "https://picsum.photos/seed/aurora50/320/180",
    title: "Northern Lights",
    duration: "15:00",
    channel: "ArcticVision",
    tags: ["Astronomy"],
  },
];

const HomePage = ({ sideNavbar }) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("All");

  // YouTube states
  const [ytVideos, setYtVideos] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);

  // ✅ Video player modal states
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");
  const [currentChannel, setCurrentChannel] = useState("");

  const options = [
    "All", "DD News", "News", "Film Criticisms", "Twenty20 Cricket", "Music", "Live", 
    "Mixes", "Gaming", "Debates", "Coke Studio India", "Democracy", "Pakistani Dramas", 
    "Comedy", "Podcasts", "Dramedy", "Web Development", "Dubbing", "Web Series", 
    "Professional Wrestling", "Bhojpuri Cinema", "Superhero movies", "Astronomy", 
    "AI", "History", "Indian Music", "Recently Uploaded", "Watched"
  ];

  useEffect(() => {
    fetchYouTubeByTopic(selectedOption);
  }, [selectedOption]);

  const fetchYouTubeByTopic = async (topic) => {
    if (topic === "All" || topic === "Recently Uploaded" || topic === "Watched") {
      setYtVideos([]);
      return;
    }

    setYtLoading(true);
    setYtVideos([]);

    for (let i = 0; i < API_KEYS.length; i++) {
      const keyIndex = (currentKeyIndex + i) % API_KEYS.length;
      try {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            q: topic,
            type: "video",
            maxResults: 20,
            order: "relevance",
            key: API_KEYS[keyIndex],
          },
        });
        currentKeyIndex = keyIndex;
        setYtVideos(res.data.items || []);
        break;
      } catch (err) {
        if (err.response?.status === 403) {
          currentKeyIndex = (keyIndex + 1) % API_KEYS.length;
          continue;
        }
        console.error("YouTube API error:", err.response?.data?.error?.message || err.message);
        break;
      }
    }
    setYtLoading(false);
  };

  // ✅ Open YouTube video modal
  const openYouTubeVideo = (videoId, title, channel) => {
    setCurrentVideoId(videoId);
    setCurrentVideoTitle(title);
    setCurrentChannel(channel);
    setIsVideoModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  // ✅ Close video modal
  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideoId(null);
    setCurrentVideoTitle("");
    setCurrentChannel("");
    document.body.style.overflow = 'unset'; // Restore scroll
  };

  const filteredVideos = selectedOption === "All"
    ? videos
    : videos.filter((v) => v.tags?.includes(selectedOption));

  // ShortsRow component (unchanged)
  const ShortsRow = ({ data, title }) => (
    <div className="homePage_shortsSection">
      <div className="homePage_shortsHeader">
        <span className="homePage_shortsTitle">🎬 {title}</span>
      </div>
      <div className="homePage_shortsRow">
        {data.map((short) => (
          <div
            key={short.id}
            className="homePage_shortCard"
            onClick={() => navigate("/reels", { state: { reelId: short.id } })}
            style={{ cursor: "pointer" }}
          >
            <div className="homePage_shortThumbnail">
              <img src={short.thumbnail} alt={short.user} className="homePage_shortImg" />
              <div className="homePage_shortPlay">▶</div>
              <div className="homePage_shortDuration">{short.duration}</div>
            </div>
            <div className="homePage_shortTitle">{short.title}</div>
            <Link
              to={`/user/${short.username}`}
              onClick={(e) => e.stopPropagation()}
              style={{ textDecoration: "none", color: "#aaa", fontSize: "13px" }}
            >
              <div className="homePage_shortUser">{short.user}</div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );

  // VideoCard for local videos (unchanged)
  const VideoCard = ({ video }) => (
    <div className="youtube_thumbnailBox">
      <Link to={`/video/${video.id}`} className="youtube_thumbnailWrapper">
        <img src={video.thumbnail} alt={video.title} className="youtube_thumbnailPic" />
        <div className="youtube_timingThumbnail">{video.duration}</div>
      </Link>
      <div className="youtubeTitleBox">
        <div className="youtubeBoxProfile">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${video.channel}`}
            alt={video.channel}
            className="youtube_thumbnail_Profile"
          />
          <Link
            to={`/user/${video.channel.toLowerCase()}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <p className="youtube_ChannelName">{video.channel}</p>
          </Link>
        </div>
        <div className="youtubeVideoInfo">
          <p className="youtube_videoTitle">{video.title}</p>
          <p className="youtubeVideo_Views">3 Likes</p>
        </div>
      </div>
    </div>
  );

  // ✅ Updated YouTubeVideoCard - opens modal
  const YouTubeVideoCard = ({ item }) => (
    <div
      className="youtube_thumbnailBox"
      style={{ cursor: "pointer" }}
      onClick={() => openYouTubeVideo(
        item.id.videoId,
        item.snippet.title,
        item.snippet.channelTitle
      )}
    >
      <div className="youtube_thumbnailWrapper" style={{ position: "relative", display: "block" }}>
        <img
          src={item.snippet.thumbnails.medium.url}
          alt={item.snippet.title}
          className="youtube_thumbnailPic"
        />
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            background: "#ff0000",
            color: "white",
            fontSize: "10px",
            fontWeight: "700",
            padding: "2px 7px",
            borderRadius: "4px",
            letterSpacing: "0.5px",
          }}
        >
          ▶ YouTube
        </div>
      </div>
      <div className="youtubeTitleBox">
        <div className="youtubeBoxProfile">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.snippet.channelTitle)}&background=random&size=36`}
            alt={item.snippet.channelTitle}
            className="youtube_thumbnail_Profile"
          />
          <p className="youtube_ChannelName">{item.snippet.channelTitle}</p>
        </div>
        <div className="youtubeVideoInfo">
          <p className="youtube_videoTitle">{item.snippet.title}</p>
          <p className="youtubeVideo_Views">
            {new Date(item.snippet.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );

  // SkeletonCard (unchanged)
  const SkeletonCard = () => (
    <div className="youtube_thumbnailBox">
      <div
        style={{
          width: "100%",
          paddingTop: "56.25%",
          background: "#272727",
          borderRadius: "12px",
          animation: "pulse 1.5s infinite",
        }}
      />
      <div style={{ padding: "10px 4px", display: "flex", gap: "10px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#272727",
            flexShrink: 0,
            animation: "pulse 1.5s infinite",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: "14px",
              background: "#272727",
              borderRadius: "4px",
              marginBottom: "8px",
              animation: "pulse 1.5s infinite",
            }}
          />
          <div
            style={{
              height: "12px",
              background: "#272727",
              borderRadius: "4px",
              width: "60%",
              animation: "pulse 1.5s infinite",
            }}
          />
        </div>
      </div>
    </div>
  );

  // ✅ Video Modal Component
  const VideoModal = () => (
    <>
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.98)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
        onClick={closeVideoModal}
      />
      <div 
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(95vw, 1000px)",
          maxHeight: "95vh",
          aspectRatio: "16/9",
          background: "#000",
          borderRadius: "16px",
          zIndex: 10000,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {currentVideoId && (
          <iframe
            src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "16px",
              border: "none",
            }}
            title={currentVideoTitle}
          />
        )}
        
        {/* Close Button */}
        <button
          onClick={closeVideoModal}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            zIndex: 2,
          }}
          onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.25)"}
          onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.15)"}
        >
          ×
        </button>
      </div>
    </>
  );

  return (
    <div className="homePage">
      {/* Options Bar (unchanged) */}
      <div className={`homePage_options ${sideNavbar ? "sidebar-open" : ""}`}>
        <div className="homePage_options_track">
          {options.map((item) => (
            <div
              key={item}
              className="homePage_option"
              onClick={() => setSelectedOption(item)}
              style={{
                cursor: "pointer",
                background: selectedOption === item ? "white" : "transparent",
                color: selectedOption === item ? "black" : "white",
                borderRadius: "8px",
                padding: "6px 12px",
                fontWeight: selectedOption === item ? "600" : "400",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className={`home_mainPage ${sideNavbar ? "sidebar-open" : "sidebar-closed"}`}>
        {selectedOption === "All" ? (
          Array.from({ length: Math.ceil(reelsData.length / 6) }).map((_, rowIndex) => {
            const start = rowIndex * 5;
            const end = start + 9;
            const videoStart = rowIndex * 8;
            const videoEnd = videoStart + 12;

            return (
              <React.Fragment key={rowIndex}>
                <ShortsRow
                  data={reelsData.slice(start, end)}
                  title={rowIndex === 0 ? "Shorts" : "More Shorts"}
                />
                {filteredVideos.slice(videoStart, videoEnd).length > 0 && (
                  <div className="youtube_VideoGrid">
                    {filteredVideos.slice(videoStart, videoEnd).map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })
        ) : (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <span style={{ fontSize: "20px" }}>{ytLoading ? "⏳" : "🔎"}</span>
              <h2 style={{ color: "white", fontSize: "18px", fontWeight: "700", margin: 0 }}>
                {selectedOption}
              </h2>
              {ytLoading && <span style={{ color: "#aaa", fontSize: "13px" }}>- loading YouTube results...</span>}
            </div>

            {filteredVideos.length > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <span style={{ background: "#272727", color: "#aaa", fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.5px" }}>
                    🎬 LOCAL VIDEOS
                  </span>
                  <span style={{ color: "#555", fontSize: "12px" }}>
                    {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="youtube_VideoGrid">
                  {filteredVideos.map((video) => <VideoCard key={video.id} video={video} />)}
                </div>
              </div>
            )}

            {ytLoading && (
              <div style={{ marginBottom: "40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <span style={{ background: "#ff000022", color: "#ff4444", fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.5px" }}>
                    ▶ YOUTUBE
                  </span>
                  <span style={{ color: "#555", fontSize: "12px" }}>fetching...</span>
                </div>
                <div className="youtube_VideoGrid">
                  {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            )}

            {!ytLoading && ytVideos.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <span style={{ background: "#ff000022", color: "#ff4444", fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.5px" }}>
                    ▶ YOUTUBE
                  </span>
                  <span style={{ color: "#555", fontSize: "12px" }}>{ytVideos.length} videos</span>
                </div>
                <div className="youtube_VideoGrid">
                  {ytVideos.map((item) => <YouTubeVideoCard key={item.id.videoId} item={item} />)}
                </div>
              </div>
            )}

            {!ytLoading && filteredVideos.length === 0 && ytVideos.length === 0 && (
              <div style={{ textAlign: "center", marginTop: "80px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <p style={{ color: "#555", fontSize: "16px" }}>
                  No videos found for "<span style={{ color: "#aaa" }}>{selectedOption}</span>"
                </p>
                <p style={{ color: "#444", fontSize: "13px", marginTop: "8px" }}>
                  Try selecting a different category
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Video Modal - renders ABOVE everything */}
      {isVideoModalOpen && <VideoModal />}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;