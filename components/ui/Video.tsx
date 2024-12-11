'use client';

import React from 'react';

type VideoProps = {
  src: string; // Path to the video file
  alt: string; // Accessibility text
};

const Video: React.FC<VideoProps> = ({src, alt}) => {
  if (!src) {
    console.error("Video component requires a 'src' property.");
    return null;
  }

  return (
    <div style={{maxWidth: '100%', margin: '1rem 0'}}>
      <video
        src={src}
        controls
        style={{width: '100%', borderRadius: '8px'}}
        aria-label={alt}
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Video;
