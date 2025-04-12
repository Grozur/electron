import { useEffect, useRef } from 'react';
import cloudinary from 'cloudinary-video-player';

const VideoPlayer = ({ id="player", publicId, playerConfig, sourceConfig, ...props }) => {
  const cloudinaryRef = useRef(null);
  const playerRef = useRef();

  useEffect(() => {
    if (cloudinaryRef.current) return;

    cloudinaryRef.current = cloudinary;
    const player = cloudinary.videoPlayer(playerRef.current, {
        cloud_name: 'dbsx9oknn', // Your Cloudinary cloud name
        secure: true,
        controls: true,
        showJumpControls: true,
        logoOnclickUrl: `${window.location.origin}`,
        logoImageUrl: 'https://assets.raspberrypi.com/favicon.png',
        fluid: false,
        width: '1280',
        height: '720',
        colors: {
          accent: '#FF0D70'
        },
        fontFace: 'Fira Sans',
        ...playerConfig, // Allow additional config props
      });
    player.source(publicId, sourceConfig);
  }, []);

  return (
    <video
      ref={playerRef}
      id={id}
      className="cld-video-player cld-fluid"
      {...props}
    />
  );
};

export default VideoPlayer;

