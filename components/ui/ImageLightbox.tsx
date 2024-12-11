'use client';

import React, {useState} from 'react';

const ImageLightbox: React.FC<{src: string; alt: string}> = ({src, alt}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) {
    console.error("ImageLightbox: Missing 'src' property.");
    return null;
  }

  const toggleLightbox = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <img
        src={src}
        alt={alt || 'Image'}
        style={{cursor: 'pointer', maxWidth: '100%', border: 'none'}}
        onClick={toggleLightbox}
      />

      {isOpen && (
        <div
          onClick={toggleLightbox}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <img
            src={src}
            alt={alt || 'Image'}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
              border: 'none',
            }}
          />
        </div>
      )}
    </>
  );
};

export default ImageLightbox;
