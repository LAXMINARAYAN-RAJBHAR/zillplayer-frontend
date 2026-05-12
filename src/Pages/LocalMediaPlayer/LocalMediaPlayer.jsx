import { useState, useRef, useEffect, useCallback } from "react";

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
};

export default function LocalMediaPlayer({ sideNavbar }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [currentObjectURL, setCurrentObjectURL] = useState(null);

  const mediaRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);
  const fileInputRef = useRef(null);

  const currentMedia = playlist[currentIndex];
  const isAudio = currentMedia?.type?.startsWith("audio");
  const isVideo = currentMedia?.type?.startsWith("video");

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing && isVideo) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing, isVideo]);

  useEffect(() => {
    if (!currentMedia) return;
    if (currentObjectURL) URL.revokeObjectURL(currentObjectURL);
    const url = URL.createObjectURL(currentMedia.file);
    setCurrentObjectURL(url);
    if (mediaRef.current) {
      mediaRef.current.src = url;
      mediaRef.current.load();
      if (playing) mediaRef.current.play().catch(() => {});
    }
    return () => URL.revokeObjectURL(url);
  }, [currentIndex, currentMedia?.file]);

  useEffect(() => {
    const m = mediaRef.current;
    if (!m) return;
    const onTime = () => {
      if (!seeking) setCurrentTime(m.currentTime);
    };
    const onDuration = () => setDuration(m.duration);
    const onEnded = () => {
      if (loop) {
        m.play();
        return;
      }
      if (shuffle) {
        const r = Math.floor(Math.random() * playlist.length);
        setCurrentIndex(r);
      } else if (currentIndex < playlist.length - 1)
        setCurrentIndex((i) => i + 1);
      else setPlaying(false);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    m.addEventListener("timeupdate", onTime);
    m.addEventListener("durationchange", onDuration);
    m.addEventListener("ended", onEnded);
    m.addEventListener("play", onPlay);
    m.addEventListener("pause", onPause);
    return () => {
      m.removeEventListener("timeupdate", onTime);
      m.removeEventListener("durationchange", onDuration);
      m.removeEventListener("ended", onEnded);
      m.removeEventListener("play", onPlay);
      m.removeEventListener("pause", onPause);
    };
  }, [loop, shuffle, currentIndex, playlist.length, seeking]);

  useEffect(() => {
    if (mediaRef.current) mediaRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = volume;
      mediaRef.current.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => {
    const handleKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          seek(5);
          break;
        case "ArrowLeft":
          seek(-5);
          break;
        case "ArrowUp":
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case "ArrowDown":
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case "m":
        case "M":
          setMuted((m) => !m);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playing]);

  const handleFiles = async (files) => {
    const mediaFiles = Array.from(files).filter(
      (f) => f.type.startsWith("video/") || f.type.startsWith("audio/"),
    );
    if (!mediaFiles.length) return;
    const newItems = mediaFiles.map((file, i) => ({
      id: Date.now() + i,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: file.type,
      size: file.size,
    }));
    setPlaylist((prev) => {
      const updated = [...prev, ...newItems];
      if (prev.length === 0) setCurrentIndex(0);
      return updated;
    });
    if (playlist.length === 0) setCurrentIndex(0);
  };

  const togglePlay = () => {
    if (!mediaRef.current || !currentMedia) return;
    if (playing) {
      mediaRef.current.pause();
      setPlaying(false);
    } else {
      mediaRef.current.play().catch(() => {});
      setPlaying(true);
    }
    resetHideTimer();
  };

  const seek = (delta) => {
    if (!mediaRef.current) return;
    mediaRef.current.currentTime = Math.max(
      0,
      Math.min(duration, mediaRef.current.currentTime + delta),
    );
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (mediaRef.current) mediaRef.current.currentTime = val;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const removeFromPlaylist = (id, e) => {
    e.stopPropagation();
    setPlaylist((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const next = prev.filter((p) => p.id !== id);
      if (idx <= currentIndex && currentIndex > 0)
        setCurrentIndex((i) => i - 1);
      return next;
    });
  };

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4];
  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 60px)",
        marginTop: "50px", // ← add this
        background: "#0a0a0a",
        fontFamily: "'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* MAIN PLAYER */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#000",
          cursor: showControls ? "default" : "none",
        }}
        onMouseMove={resetHideTimer}
        onClick={() => {
          if (isVideo) togglePlay();
        }}
      >
        {/* NO MEDIA STATE */}
        {!currentMedia && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
              gap: 16,
              cursor: "pointer",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setDragOver(false);

              const items = [...e.dataTransfer.items];
              const files = [];

              for (const item of items) {
                const entry = item.webkitGetAsEntry?.();
                if (entry?.isDirectory) {
                  // read folder contents
                  await new Promise((resolve) => {
                    entry.createReader().readEntries((entries) => {
                      entries.forEach((en) => {
                        if (en.isFile) {
                          en.file((f) => {
                            if (
                              f.type.startsWith("video/") ||
                              f.type.startsWith("audio/")
                            )
                              files.push(f);
                          });
                        }
                      });
                      setTimeout(resolve, 300); // wait for file() callbacks
                    });
                  });
                } else if (entry?.isFile) {
                  entry.file((f) => files.push(f));
                }
              }

              if (files.length) handleFiles(files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: `2px dashed ${dragOver ? "#e50914" : "#333"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.2s",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke={dragOver ? "#e50914" : "#555"}
                strokeWidth="1.5"
              >
                <path
                  d="M12 16V4M12 4L8 8M12 4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              style={{
                fontSize: 18,
                color: dragOver ? "#e50914" : "#555",
                transition: "color 0.2s",
                margin: 0,
              }}
            >
              Drop video or audio files here
            </p>
            <p style={{ fontSize: 13, color: "#444", margin: 0 }}>
              or click to browse
            </p>
            <p style={{ fontSize: 12, color: "#333", margin: 0 }}>
              MP4, MKV, AVI, MOV, MP3, WAV, FLAC, AAC, OGG
            </p>
          </div>
        )}

        {/* AUDIO VISUALIZER */}
        {currentMedia && isAudio && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #0d0d0d 0%, #1a0000 100%)",
            }}
          >
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "#111",
                border: "3px solid #e50914",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {playing && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    animation: "spin 4s linear infinite",
                    background:
                      "conic-gradient(from 0deg, transparent 0%, #e5091420 50%, transparent 100%)",
                  }}
                />
              )}
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e50914"
                strokeWidth="1.2"
              >
                <path
                  d="M9 18V5l12-2v13"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <p
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 600,
                margin: "0 0 6px",
                textAlign: "center",
                maxWidth: 400,
              }}
            >
              {currentMedia.name}
            </p>
            <p style={{ color: "#666", fontSize: 13, margin: 0 }}>
              {formatSize(currentMedia.size)}
            </p>
            <div
              style={{
                display: "flex",
                gap: 4,
                marginTop: 24,
                alignItems: "flex-end",
                height: 40,
              }}
            >
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    borderRadius: 2,
                    background: "#e50914",
                    height: playing
                      ? `${20 + Math.sin(Date.now() / 200 + i) * 15}px`
                      : "8px",
                    transition: "height 0.1s",
                    animation: playing
                      ? `eq ${0.5 + i * 0.05}s ease-in-out infinite alternate`
                      : "none",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIDEO ELEMENT */}
        {currentMedia && isVideo && (
          <video
            ref={mediaRef}
            style={{
              flex: 1,
              width: "100%",
              objectFit: "contain",
              filter: `brightness(${brightness}%)`,
            }}
            playsInline
          />
        )}
        {currentMedia && isAudio && (
          <audio ref={mediaRef} style={{ display: "none" }} />
        )}

        {/* CONTROLS OVERLAY */}
        {currentMedia && (
          <div
            style={{
              position: isVideo ? "absolute" : "relative",
              bottom: 0,
              left: 0,
              right: 0,
              background: isVideo
                ? "linear-gradient(transparent, rgba(0,0,0,0.9))"
                : "transparent",
              padding: isVideo ? "40px 16px 16px" : "0 16px 16px",
              opacity: isVideo ? (showControls ? 1 : 0) : 1,
              transition: "opacity 0.3s",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* SEEK BAR */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*,audio/*"
                webkitdirectory="" // ← lets user pick a whole folder
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: 4,
                  width: `${progressPct}%`,
                  background: "#e50914",
                  borderRadius: 2,
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* CONTROLS ROW */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* PREV */}
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                style={{
                  background: "none",
                  border: "none",
                  color: currentIndex === 0 ? "#444" : "#fff",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 18V6h2v5.5l8.5-5v11l-8.5-5V18H6z" />
                </svg>
              </button>

              {/* REWIND */}
              <button
                onClick={() => seek(-10)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ccc",
                  cursor: "pointer",
                  padding: 4,
                  fontSize: 11,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                  </svg>
                  <span style={{ fontSize: 9, marginTop: -2 }}>10</span>
                </div>
              </button>

              {/* PLAY/PAUSE */}
              <button
                onClick={togglePlay}
                style={{
                  background: "#e50914",
                  border: "none",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                {playing ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* FORWARD */}
              <button
                onClick={() => seek(10)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ccc",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                  </svg>
                  <span style={{ fontSize: 9, marginTop: -2 }}>10</span>
                </div>
              </button>

              {/* NEXT */}
              <button
                onClick={() =>
                  setCurrentIndex((i) => Math.min(playlist.length - 1, i + 1))
                }
                disabled={currentIndex === playlist.length - 1}
                style={{
                  background: "none",
                  border: "none",
                  color: currentIndex === playlist.length - 1 ? "#444" : "#fff",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18 6v12h-2v-5.5L7.5 18v-11L16 12.5V6h2z" />
                </svg>
              </button>

              {/* VOLUME */}
              <button
                onClick={() => setMuted((m) => !m)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ccc",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                {muted || volume === 0 ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setMuted(false);
                }}
                style={{ width: 70, accentColor: "#e50914", cursor: "pointer" }}
              />

              {/* TIME */}
              <span
                style={{
                  color: "#ccc",
                  fontSize: 13,
                  marginLeft: 4,
                  whiteSpace: "nowrap",
                }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div style={{ flex: 1 }} />

              {/* SHUFFLE */}
              <button
                onClick={() => setShuffle((s) => !s)}
                title="Shuffle"
                style={{
                  background: "none",
                  border: "none",
                  color: shuffle ? "#e50914" : "#888",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                </svg>
              </button>

              {/* LOOP */}
              <button
                onClick={() => setLoop((l) => !l)}
                title="Loop"
                style={{
                  background: "none",
                  border: "none",
                  color: loop ? "#e50914" : "#888",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                </svg>
              </button>

              {/* SPEED */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeedMenu((s) => !s);
                  }}
                  style={{
                    background: "none",
                    border: "1px solid #444",
                    borderRadius: 4,
                    color: speed !== 1 ? "#e50914" : "#ccc",
                    cursor: "pointer",
                    padding: "3px 7px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {speed}x
                </button>
                {showSpeedMenu && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      right: 0,
                      background: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: 6,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {speeds.map((s) => (
                      <div
                        key={s}
                        onClick={() => {
                          setSpeed(s);
                          setShowSpeedMenu(false);
                        }}
                        style={{
                          padding: "8px 20px",
                          cursor: "pointer",
                          fontSize: 13,
                          color: speed === s ? "#e50914" : "#ccc",
                          background: speed === s ? "#2a0000" : "transparent",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s}x {s === 1 ? "(normal)" : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BRIGHTNESS (video only) */}
              {isVideo && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#888">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z" />
                  </svg>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    style={{
                      width: 60,
                      accentColor: "#e50914",
                      cursor: "pointer",
                    }}
                  />
                </div>
              )}

              {/* FULLSCREEN (video only) */}
              {isVideo && (
                <button
                  onClick={toggleFullscreen}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ccc",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  {fullscreen ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PLAYLIST SIDEBAR */}
      {showPlaylist && (
        <div
          style={{
            width: 300,
            background: "#111",
            borderLeft: "1px solid #222",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* SIDEBAR HEADER */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #222",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
              Playlist ({playlist.length})
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: "#e50914",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                + Add Files
              </button>
              {playlist.length > 0 && (
                <button
                  onClick={() => {
                    setPlaylist([]);
                    setCurrentIndex(0);
                    setPlaying(false);
                  }}
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: 6,
                    color: "#888",
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* DRAG DROP IN SIDEBAR */}
          <div
            style={{ flex: 1, overflowY: "auto" }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
          >
            {playlist.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "#444",
                  fontSize: 13,
                }}
              >
                <p>No files in playlist</p>
                <p style={{ fontSize: 12 }}>
                  Drag & drop files or click "Add Files"
                </p>
              </div>
            ) : (
              playlist.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(i);
                    if (mediaRef.current) {
                      mediaRef.current.currentTime = 0;
                      mediaRef.current.play().catch(() => {});
                      setPlaying(true);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    cursor: "pointer",
                    background: i === currentIndex ? "#1a0000" : "transparent",
                    borderLeft:
                      i === currentIndex
                        ? "3px solid #e50914"
                        : "3px solid transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (i !== currentIndex)
                      e.currentTarget.style.background = "#161616";
                  }}
                  onMouseLeave={(e) => {
                    if (i !== currentIndex)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 4,
                      background: "#1a1a1a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i === currentIndex && playing ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 2,
                          alignItems: "flex-end",
                          height: 16,
                        }}
                      >
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            style={{
                              width: 3,
                              background: "#e50914",
                              borderRadius: 1,
                              height: `${8 + j * 3}px`,
                              animation: `eq ${0.4 + j * 0.1}s ease-in-out infinite alternate`,
                            }}
                          />
                        ))}
                      </div>
                    ) : item.type.startsWith("video") ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#555"
                      >
                        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#555"
                      >
                        <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        color: i === currentIndex ? "#fff" : "#bbb",
                        fontSize: 13,
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: i === currentIndex ? 600 : 400,
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{ color: "#555", fontSize: 11, margin: "2px 0 0" }}
                    >
                      {item.type.split("/")[0]} · {formatSize(item.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => removeFromPlaylist(item.id, e)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#444",
                      cursor: "pointer",
                      padding: 4,
                      flexShrink: 0,
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#e50914")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* KEYBOARD SHORTCUTS */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid #1a1a1a",
              fontSize: 11,
              color: "#333",
              lineHeight: 1.7,
            }}
          >
            <span style={{ color: "#444", fontWeight: 600 }}>Shortcuts: </span>
            Space = play/pause · ←/→ = seek · ↑/↓ = volume · M = mute · F =
            fullscreen
          </div>
        </div>
      )}

      {/* TOGGLE PLAYLIST BUTTON */}
      <button
        onClick={() => setShowPlaylist((p) => !p)}
        style={{
          position: "absolute",
          right: showPlaylist ? 308 : 8,
          bottom: 80,
          background: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#888",
          zIndex: 10,
          transition: "right 0.3s",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path
            d={
              showPlaylist
                ? "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                : "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
            }
          />
        </svg>
      </button>

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <style>{`
        @keyframes eq {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1.5); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input[type=range]::-webkit-slider-thumb { cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>
    </div>
  );
}
