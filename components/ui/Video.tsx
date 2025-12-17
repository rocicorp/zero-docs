'use client';

import React from 'react';

type VideoProps = {
  src?: `/${string}`; // Path to the video file
  alt?: string; // Accessibility text
  animation?: boolean;
};

const Video: React.FC<VideoProps> = ({src, alt, animation}) => {
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

  const videoSrc = `https://d2nzlypqdo5xbb.cloudfront.net${src}`;

  return (
    <div style={{maxWidth: '100%', margin: '1rem 0'}}>
      <video
        src={videoSrc}
        controls={!animation}
        style={{width: '100%', borderRadius: '8px'}}
        aria-label={alt}
        autoPlay={Boolean(animation)}
        loop={Boolean(animation)}
        muted={Boolean(animation)}
        playsInline
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Video;
