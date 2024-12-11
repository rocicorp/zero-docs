'use client';

import Image from 'next/image';
import {FC, useState} from 'react';

type ResponsiveImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

const ResponsiveImage: FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  caption,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClick = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        margin: '3rem auto 4rem',
        overflow: 'hidden',
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        priority
        style={{
          cursor: 'pointer',
        }}
        onClick={handleClick}
      />

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.93)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={handleClick}
        >
          <Image
            src={src}
            alt={alt}
            layout="intrinsic" // Intrinsic layout to allow natural sizing
            width={width}
            height={height}
            style={{
              width: '90vw',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Caption */}
      {caption && (
        <figcaption style={{textAlign: 'center', marginTop: '1rem'}}>
          {caption}
        </figcaption>
      )}
    </div>
  );
};

export default ResponsiveImage;
