import { useState, useRef, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import cloudinary from 'cloudinary-video-player/all';
import 'cloudinary-video-player/cld-video-player.min.css';

const SingleVideo = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/dartek-local/api/videos/${videoId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Film nie znaleziony lub nieosiągalny.");
        return res.json();
      })
      .then((data) => setVideo(data))
      .catch((err) => setError(err.message));
  }, [videoId]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-white bg-black">{error}</div>;
  if (!video) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Ładowanie...</div>;

  const videoURL = `${window.location.origin}/dartek/${videoId}`;
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Helmet>
  <title>{video.title || "test!"}</title>
  <meta property="og:title" content={video.title || "test!"} />
  <meta property="og:type" content="video.other" />
  <meta property="og:url" content={videoURL} />
  <meta property="og:video" content={`${window.location.origin}/dartek/back${video.filePath}`} />
  <meta property="og:video:secure_url" content={`${window.location.origin}/dartek/back${video.filePath}`} />
  <meta property="og:video:type" content="video/mp4" />
  <meta property="og:video:width" content="1280" />
  <meta property="og:video:height" content="720" />
  <meta property="og:description" content={video.description || "test!"} />
</Helmet>

<div style={{ width: "1280px", height: "720px" }}>
        <VideoPlayer 
          src={`/dartek/back${video.filePath}`}
          playerConfig={{ controls: true }} 
          sourceConfig={{ sourceTypes: ['mp4'] }} 
        />
      </div>
    </div>
  );
};

export default SingleVideo;




