import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const API_KEYS = [
  process.env.REACT_APP_YOUTUBE_KEY_1,
  process.env.REACT_APP_YOUTUBE_KEY_2,
  process.env.REACT_APP_YOUTUBE_KEY_3,
  process.env.REACT_APP_YOUTUBE_KEY_4,
  process.env.REACT_APP_YOUTUBE_KEY_5,
  process.env.REACT_APP_YOUTUBE_KEY_6,
];

let currentKeyIndex = 0;
const cache = {};

const defaultQueries = [
  "trending videos 2025",
  "viral videos 2025",
  "new movies 2025",
  "latest music 2025",
  "funny videos 2025",
];

const YouTubeSearch = () => {
  const [autoplay, setAutoplay] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [comment, setComment] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, user: "Rahul", text: "Amazing video! 🔥", time: "2 days ago", likes: 24 },
    { id: 2, user: "Priya", text: "Loved this content!", time: "1 day ago", likes: 12 },
    { id: 3, user: "Amit", text: "Very informative, thanks!", time: "5 hours ago", likes: 5 },
  ]);

  const location = useLocation();
  const autoplayRef = React.useRef(autoplay);

  useEffect(() => { autoplayRef.current = autoplay; }, [autoplay]);

  useEffect(() => {
    if (!selectedVideo) return;
    const handleMessage = (event) => {
      if (event.origin !== "https://www.youtube.com") return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === "onStateChange" && data.info === 0) {
          if (!autoplayRef.current) return;
          const n = selectedVideoIndex + 1;
          if (n < results.length) {
            setSelectedVideo(results[n].id.videoId);
            setSelectedVideoIndex(n);
            setComment("");
            setLiked(false);
            setDisliked(false);
            setShowFullDesc(false);
          }
        }
      } catch (e) {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [selectedVideo, selectedVideoIndex, results]);

  useEffect(() => {
    const handleReload = () => {
      const randomQuery = defaultQueries[Math.floor(Math.random() * defaultQueries.length)];
      searchWithQuery(randomQuery, true);
    };
    window.addEventListener("youtube-reload", handleReload);
    return () => window.removeEventListener("youtube-reload", handleReload);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromNav = params.get("search");
    if (searchFromNav) {
      setQuery(searchFromNav);
      searchWithQuery(searchFromNav, true);
    } else {
      const randomQuery = defaultQueries[Math.floor(Math.random() * defaultQueries.length)];
      searchWithQuery(randomQuery, true);
    }
  }, [location.search, location.pathname, location.state]);

  const searchWithQuery = async (q, forceRefresh = false) => {
    if (cache[q] && !forceRefresh) {
      setResults(cache[q]);
      return;
    }
    setLoading(true);
    setError("");
    let allFailed = true;

    for (let i = 0; i < API_KEYS.length; i++) {
      const keyIndex = (currentKeyIndex + i) % API_KEYS.length;
      try {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            q,
            type: "video",
            maxResults: 50,
            order: "date",
            key: API_KEYS[keyIndex],
          },
        });
        currentKeyIndex = keyIndex;
        cache[q] = res.data.items;
        setResults(res.data.items);
        allFailed = false;
        setLoading(false);
        return;
      } catch (err) {
        if (err.response?.status === 403) {
          currentKeyIndex = (keyIndex + 1) % API_KEYS.length;
          continue;
        }
        setError(err.response?.data?.error?.message || "Something went wrong");
        allFailed = false;
        break;
      }
    }

    if (allFailed) {
      setError("All API keys exhausted for today 😔 Please add fresh API keys or try again tomorrow.");
    }
    setLoading(false);
  };

  const openVideo = (item, index) => {
    setSelectedVideo(item.id.videoId);
    setSelectedVideoIndex(index);
    setLiked(false);
    setDisliked(false);
    setSubscribed(false);
    setComment("");
    setShowFullDesc(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentItem = selectedVideo && results[selectedVideoIndex];
  const relatedVideos = selectedVideo ? results.filter((_, i) => i !== selectedVideoIndex) : [];

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", paddingTop: "70px", fontFamily: "Roboto, Arial, sans-serif" }}>

      {error && (
        <div style={{ background: "#ff4444", color: "white", padding: "12px 20px", margin: "10px 20px", borderRadius: "6px", fontSize: "14px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── WATCH PAGE LAYOUT ── */}
      {selectedVideo ? (
        <div style={{ display: "flex", gap: "24px", padding: "20px 24px", maxWidth: "1600px", margin: "0 auto" }}>

          {/* LEFT: Player + info */}
          <div style={{ flex: "1 1 0", minWidth: 0 }}>

            {/* iframe */}
            <div style={{ borderRadius: "12px", overflow: "hidden", background: "#000" }}>
              <iframe
                key={selectedVideo}
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
                allow="autoplay; fullscreen"
                allowFullScreen
                style={{ display: "block", border: "none" }}
                title="YouTube Player"
              />
            </div>

            {/* ── Prev / Autoplay / Next bar ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#181818", borderRadius: "10px", padding: "10px 16px", marginTop: "10px" }}>
              {/* Prev */}
              <button
                onClick={() => {
                  const p = selectedVideoIndex - 1;
                  if (p >= 0) openVideo(results[p], p);
                }}
                disabled={selectedVideoIndex === 0}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: selectedVideoIndex === 0 ? "#2a2a2a" : "#272727",
                  border: "none", color: selectedVideoIndex === 0 ? "#555" : "white",
                  borderRadius: "20px", padding: "8px 18px",
                  cursor: selectedVideoIndex === 0 ? "not-allowed" : "pointer",
                  fontSize: "14px", fontWeight: "600", transition: "background 0.2s"
                }}
                onMouseEnter={e => { if (selectedVideoIndex !== 0) e.currentTarget.style.background = "#3a3a3a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = selectedVideoIndex === 0 ? "#2a2a2a" : "#272727"; }}
              >
                ⏮ Previous
              </button>

              {/* Autoplay toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#aaa", fontSize: "13px", fontWeight: "500" }}>Autoplay</span>
                <div
                  onClick={() => setAutoplay(!autoplay)}
                  style={{ width: "44px", height: "24px", background: autoplay ? "#ff0000" : "#555", borderRadius: "12px", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}
                >
                  <div style={{ width: "18px", height: "18px", background: "white", borderRadius: "50%", position: "absolute", top: "3px", left: autoplay ? "23px" : "3px", transition: "left 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
                </div>
                <span style={{ color: autoplay ? "#ff0000" : "#555", fontSize: "12px", fontWeight: "600", minWidth: "24px" }}>
                  {autoplay ? "ON" : "OFF"}
                </span>
              </div>

              {/* Next */}
              <button
                onClick={() => {
                  const n = selectedVideoIndex + 1;
                  if (n < results.length) openVideo(results[n], n);
                }}
                disabled={selectedVideoIndex === results.length - 1}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: selectedVideoIndex === results.length - 1 ? "#2a2a2a" : "#ff0000",
                  border: "none", color: selectedVideoIndex === results.length - 1 ? "#555" : "white",
                  borderRadius: "20px", padding: "8px 18px",
                  cursor: selectedVideoIndex === results.length - 1 ? "not-allowed" : "pointer",
                  fontSize: "14px", fontWeight: "600", transition: "background 0.2s"
                }}
                onMouseEnter={e => { if (selectedVideoIndex !== results.length - 1) e.currentTarget.style.background = "#cc0000"; }}
                onMouseLeave={e => { e.currentTarget.style.background = selectedVideoIndex === results.length - 1 ? "#2a2a2a" : "#ff0000"; }}
              >
                Next ⏭
              </button>
            </div>

            {currentItem && (
              <>
                {/* Title */}
                <div style={{ color: "white", fontWeight: "700", fontSize: "18px", lineHeight: "1.4", marginTop: "14px" }}>
                  {currentItem.snippet.title}
                </div>

                {/* Channel row + action buttons */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentItem.snippet.channelTitle)}&background=random&size=40`}
                      alt="channel"
                      style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                    />
                    <div>
                      <div style={{ color: "white", fontWeight: "600", fontSize: "15px" }}>{currentItem.snippet.channelTitle}</div>
                      <div style={{ color: "#aaa", fontSize: "12px" }}>1.2M subscribers</div>
                    </div>
                    <button
                      onClick={() => setSubscribed(!subscribed)}
                      style={{
                        background: subscribed ? "#272727" : "white",
                        color: subscribed ? "white" : "black",
                        border: "none", borderRadius: "20px",
                        padding: "8px 18px", fontWeight: "700",
                        cursor: "pointer", fontSize: "14px", marginLeft: "8px"
                      }}
                    >
                      {subscribed ? "✓ Subscribed" : "Subscribe"}
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", background: "#272727", borderRadius: "20px", overflow: "hidden" }}>
                      <button
                        onClick={() => { setLiked(!liked); if (disliked) setDisliked(false); }}
                        style={{
                          background: liked ? "#3ea6ff22" : "transparent",
                          border: "none", color: liked ? "#3ea6ff" : "white",
                          padding: "8px 16px", cursor: "pointer", fontSize: "14px",
                          borderRight: "1px solid #3a3a3a"
                        }}
                      >👍 1.1K</button>
                      <button
                        onClick={() => { setDisliked(!disliked); if (liked) setLiked(false); }}
                        style={{
                          background: disliked ? "#ff444422" : "transparent",
                          border: "none", color: disliked ? "#ff4444" : "white",
                          padding: "8px 16px", cursor: "pointer", fontSize: "14px"
                        }}
                      >👎</button>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${selectedVideo}`); alert("Link copied!"); }}
                      style={{ background: "#272727", border: "none", color: "white", borderRadius: "20px", padding: "8px 16px", cursor: "pointer", fontSize: "14px" }}
                    >🔗 Share</button>
                    <button
                      onClick={() => { setSelectedVideo(null); setSelectedVideoIndex(null); }}
                      style={{ background: "#272727", border: "none", color: "#aaa", borderRadius: "20px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" }}
                    >✕ Close</button>
                  </div>
                </div>

                {/* Description box */}
                <div
                  style={{ background: "#272727", borderRadius: "12px", padding: "14px 16px", marginTop: "14px", color: "#ccc", fontSize: "14px", lineHeight: "1.6", cursor: "pointer" }}
                  onClick={() => setShowFullDesc(!showFullDesc)}
                >
                  <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px" }}>
                    {new Date(currentItem.snippet.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                  <p style={{ margin: 0, display: showFullDesc ? "block" : "-webkit-box", WebkitLineClamp: showFullDesc ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: showFullDesc ? "visible" : "hidden" }}>
                    {currentItem.snippet.description || "No description available."}
                  </p>
                  <span style={{ color: "white", fontWeight: "600", fontSize: "13px", marginTop: "6px", display: "block" }}>
                    {showFullDesc ? "Show less" : "...more"}
                  </span>
                </div>

                {/* Comments */}
                <div style={{ marginTop: "28px" }}>
                  <div style={{ color: "white", fontWeight: "600", fontSize: "16px", marginBottom: "20px" }}>
                    {comments.length} Comments
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                    <img src="https://athenabpo.com/wp-content/uploads/2016/09/Headshot-Blank-Person-Circle-300x300.gif" alt="user"
                      style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <input
                        type="text" value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && comment.trim()) {
                            setComments([{ id: Date.now(), text: comment, user: "You", time: "Just now", likes: 0 }, ...comments]);
                            setComment("");
                          }
                        }}
                        placeholder="Add a comment..."
                        style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #555", color: "white", fontSize: "14px", padding: "8px 0", outline: "none", boxSizing: "border-box" }}
                      />
                      {comment.trim() && (
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                          <button onClick={() => setComment("")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
                          <button
                            onClick={() => { setComments([{ id: Date.now(), text: comment, user: "You", time: "Just now", likes: 0 }, ...comments]); setComment(""); }}
                            style={{ background: "#3ea6ff", border: "none", color: "black", borderRadius: "20px", padding: "6px 16px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}
                          >Comment</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {comments.map((c) => (
                    <div key={c.id} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.user)}&background=random&size=36`} alt={c.user}
                        style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ color: "white", fontWeight: "600", fontSize: "13px" }}>{c.user}</span>
                          <span style={{ color: "#aaa", fontSize: "12px" }}>{c.time}</span>
                        </div>
                        <div style={{ color: "#ccc", fontSize: "14px", marginTop: "4px" }}>{c.text}</div>
                        <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                          <span style={{ color: "#aaa", fontSize: "13px", cursor: "pointer" }}>👍 {c.likes}</span>
                          <span style={{ color: "#aaa", fontSize: "13px", cursor: "pointer" }}>👎</span>
                          <span style={{ color: "#aaa", fontSize: "13px", cursor: "pointer" }}>Reply</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Related videos sidebar — sticky + scrollable */}
          <div style={{
            width: "402px",
            flexShrink: 0,
            position: "sticky",
            top: "70px",
            height: "calc(100vh - 90px)",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#555 transparent"
          }}>
            {/* Autoplay toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginBottom: "12px" }}>
              <span style={{ color: "#aaa", fontSize: "13px" }}>Autoplay</span>
              <div
                onClick={() => setAutoplay(!autoplay)}
                style={{ width: "42px", height: "24px", background: autoplay ? "#3ea6ff" : "#555", borderRadius: "12px", cursor: "pointer", position: "relative", transition: "background 0.3s" }}
              >
                <div style={{ width: "18px", height: "18px", background: "white", borderRadius: "50%", position: "absolute", top: "3px", left: autoplay ? "21px" : "3px", transition: "left 0.3s" }} />
              </div>
            </div>

            {/* Related list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {relatedVideos.map((item) => {
                const realIndex = results.indexOf(item);
                return (
                  <div
                    key={item.id.videoId}
                    onClick={() => openVideo(item, realIndex)}
                    style={{ display: "flex", gap: "8px", cursor: "pointer", borderRadius: "8px", padding: "4px", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1e1e1e"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ position: "relative", flexShrink: 0, width: "168px", height: "94px", borderRadius: "8px", overflow: "hidden" }}>
                      <img
                        src={item.snippet.thumbnails.medium.url}
                        alt={item.snippet.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: "2px" }}>
                      <div style={{
                        color: "white", fontSize: "13px", fontWeight: "600", lineHeight: "1.4",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        marginBottom: "4px"
                      }}>
                        {item.snippet.title}
                      </div>
                      <div style={{ color: "#aaa", fontSize: "12px", marginBottom: "2px" }}>{item.snippet.channelTitle}</div>
                      <div style={{ color: "#aaa", fontSize: "12px" }}>
                        {new Date(item.snippet.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      ) : (
        /* ── HOME GRID ── */
        <>
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px", padding: "20px" }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ background: "#272727", borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ width: "100%", paddingTop: "56.25%", background: "#3a3a3a", animation: "pulse 1.5s infinite" }} />
                  <div style={{ padding: "12px" }}>
                    <div style={{ height: "14px", background: "#3a3a3a", borderRadius: "4px", marginBottom: "8px" }} />
                    <div style={{ height: "12px", background: "#3a3a3a", borderRadius: "4px", width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px", padding: "20px" }}>
              {results.map((item) => (
                <div
                  key={item.id.videoId}
                  onClick={() => openVideo(item, results.indexOf(item))}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
                    <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title}
                      style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} />
                  </div>
                  <div style={{ display: "flex", gap: "12px", padding: "12px 4px" }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.snippet.channelTitle)}&background=random&size=36`} alt="channel"
                      style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "white", fontWeight: "600", fontSize: "14px", lineHeight: "1.4", marginBottom: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.snippet.title}
                      </div>
                      <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "2px" }}>{item.snippet.channelTitle}</div>
                      <div style={{ color: "#aaa", fontSize: "12px" }}>
                        {new Date(item.snippet.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && !error && (
            <p style={{ color: "#888", textAlign: "center", marginTop: "100px", fontSize: "16px" }}>
              🔍 No videos found
            </p>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

export default YouTubeSearch;