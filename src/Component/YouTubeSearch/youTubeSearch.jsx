import React, { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY; // ← paste your real key here

const YouTubeSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  // ADD this useEffect right after your state declarations
  useEffect(() => {
    loadDefaultVideos();
  }, []);

  const loadDefaultVideos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: "trending videos 2025", // ← default search query on load
            type: "video",
            maxResults: 12,
            key: API_KEY,
          },
        },
      );
      setResults(res.data.items);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const searchVideos = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: query,
            type: "video",
            maxResults: 12,
            key: API_KEY,
          },
        },
      );
      setResults(res.data.items);
    } catch (err) {
      // ✅ shows exact error on screen so you can debug
      setError(err.response?.data?.error?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        padding: "20px",
        paddingTop: "40px",  // ← ADD THIS LINE
        background: "#0f0f0f",
        minHeight: "100vh",
        color: "white", // ✅ ensures text is visible
      }}
    >
      <h2 style={{ color: "white", marginBottom: "20px" }}>
        🔴 YouTube Search
      </h2>

      {/* SEARCH BAR */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchVideos()}
          placeholder="Search YouTube videos..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #555",
            background: "#222",
            color: "white",
            fontSize: "16px",
          }}
        />
        <button
          onClick={searchVideos}
          style={{
            padding: "12px 24px",
            background: "#ff0000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Search
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          style={{
            background: "#ff4444",
            color: "white",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          ⚠️ Error: {error}
        </div>
      )}

      {loading && <p style={{ color: "white" }}>🔍 Searching...</p>}

      {/* VIDEO PLAYER */}
      {selectedVideo && (
        <div style={{ marginBottom: "30px" }}>
          <iframe
            width="100%"
            height="480"
            src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ borderRadius: "10px", border: "none" }}
            title="YouTube Player"
          />
          <button
            onClick={() => setSelectedVideo(null)}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              background: "#333",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* RESULTS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {results.map((item) => (
          <div
            key={item.id.videoId}
            onClick={() => setSelectedVideo(item.id.videoId)}
            style={{
              background: "#1a1a1a",
              borderRadius: "10px",
              cursor: "pointer",
              overflow: "hidden",
              transition: "transform 0.2s",
              border: "1px solid #333",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img
              src={item.snippet.thumbnails.medium.url}
              alt={item.snippet.title}
              style={{ width: "100%", display: "block" }}
            />
            <div style={{ padding: "10px" }}>
              <div
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "6px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.snippet.title}
              </div>
              <div style={{ color: "#aaa", fontSize: "12px" }}>
                {item.snippet.channelTitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NO RESULTS */}
      {!loading && results.length === 0 && !error && (
        <p style={{ color: "#888", textAlign: "center", marginTop: "60px" }}>
          Search for any YouTube video above 🔍
        </p>
      )}
    </div>
  );
};

export default YouTubeSearch;
