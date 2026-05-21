'use client';

import {
  enterFullscreen,
  exitFullscreen,
  isCurrentlyFullscreen,
} from '@/lib/fullscreen';
import React, { useEffect, useRef, useState } from 'react';

type VideoProps = {
  src?: `/${string}`; // Path to the video file
  alt?: string; // Accessibility text
  animation?: boolean;
  poster?: string;
  preload?: React.VideoHTMLAttributes<HTMLVideoElement>['preload'];
  variant?: 'docs' | 'landing';
};

const docsContainerStyle: React.CSSProperties = {
  maxWidth: '100%',
  margin: '1rem 0',
  position: 'relative',
};

const docsVideoStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '8px',
};

const docsControlButtonStyle: React.CSSProperties = {
  alignItems: 'center',
  background: 'rgba(0, 0, 0, 0.72)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '9999px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  height: '2.25rem',
  justifyContent: 'center',
  padding: 0,
  width: '2.25rem',
};

const docsIconStyle: React.CSSProperties = {
  display: 'block',
  height: '1.125rem',
  width: '1.125rem',
};

const PlayIcon = ({className}: {className?: string}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({className}: {className?: string}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const FullscreenIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

const Video: React.FC<VideoProps> = ({
  src,
  alt, 
  poster,
  preload,
  variant = 'docs',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const isLanding = variant === 'landing'; 

  const toggleVideoPlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.paused) {
      void videoElement.play();
      setIsPlaying(true);
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;

    if (!isCurrentlyFullscreen(videoElement)) {
      void enterFullscreen(videoElement);
    } else {
      void exitFullscreen(videoElement);
    }
  };

  useEffect(() => {
    if (!isLanding) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updatePlaying = () => {
      setIsPlaying(!videoElement.paused);
    };
    const onPlay = () => {
      updatePlaying();
      setIsVideoReady(true);
    };
    const onPause = () => updatePlaying();
    const onCanPlay = () => {
      updatePlaying();
      setIsVideoReady(true);
    };

    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);
    videoElement.addEventListener('canplay', onCanPlay);

    return () => {
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('pause', onPause);
      videoElement.removeEventListener('canplay', onCanPlay);
    };
  }, [isLanding]);

  const handleVideoClick: React.MouseEventHandler<HTMLVideoElement> = event => {
    if (!isLanding) return;

    event.preventDefault();
    event.stopPropagation();
    toggleVideoPlayPause();
  };

  const handlePlayPauseClick: React.MouseEventHandler<
    HTMLButtonElement
  > = event => {
    event.preventDefault();
    event.stopPropagation();
    toggleVideoPlayPause();
  };

  const handleFullscreenClick: React.MouseEventHandler<HTMLElement> = event => {
    event.preventDefault();
    event.stopPropagation();
    toggleFullscreen();
  };

  const handleFullscreenKeyDown: React.KeyboardEventHandler<
    HTMLSpanElement
  > = event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    event.stopPropagation();
    toggleFullscreen();
  };

  const docsControlsStyle: React.CSSProperties = {
    alignItems: 'center',
    bottom:   '0.75rem',
    display: 'flex',
    gap: '0.5rem',
    position: 'absolute',
    right: '0.75rem',
    zIndex: 1,
  };

  const showControls = !isLanding || isVideoReady;

  if (!src) {
    console.error("Video component requires a 'src' property.");
    return null;
  }

  if (!alt) {
    console.error("Video component requires an 'alt' property.");
    return null;
  }

  if (!src.startsWith('/')) {
    console.error('Video src must be a local path');
    return null;
  }

  return (
    <div
      className={isLanding ? 'video-container' : undefined}
      style={isLanding ? undefined : docsContainerStyle}
    >
      <video
        ref={videoRef}
        className={isLanding ? 'video-player' : undefined}
        src={src}
        controls={false}
        style={isLanding ? {cursor: 'pointer'} : docsVideoStyle}
        aria-label={alt}
        autoPlay={true}
        loop={true}
        muted={true}
        playsInline
        preload={preload}
        poster={poster}
        onClick={isLanding ? handleVideoClick : undefined}
      >
        {isLanding ? null : <track kind="captions" />}
        Your browser does not support the video tag.
      </video>
      {showControls ? (
        <div
          className={isLanding ? 'video-controls' : undefined}
          style={isLanding ? undefined : docsControlsStyle}
        >
          {isLanding ? (
            <button
              type="button"
              className="video-control-btn video-play-pause"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={handlePlayPauseClick}
            >
              {isPlaying ? (
                <PauseIcon className="video-icon" />
              ) : (
                <PlayIcon className="video-icon" />
              )}
            </button>
          ) : null}
          {isLanding ? (
            <button
              type="button"
              className="video-control-btn video-fullscreen"
              aria-label="Fullscreen"
              onClick={handleFullscreenClick}
            >
              <FullscreenIcon className="video-icon" />
            </button>
          ) : (
            <span
              role="button"
              tabIndex={0}
              style={docsControlButtonStyle}
              aria-label="Fullscreen"
              onClick={handleFullscreenClick}
              onKeyDown={handleFullscreenKeyDown}
            >
              <FullscreenIcon style={docsIconStyle} />
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Video;
