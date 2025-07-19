'use client';

import React, {useState, CSSProperties} from 'react';

const ImageLightbox: React.FC<{
  src: string;
  caption: string;
  style: CSSProperties;
}> = ({src, caption, style}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) {
    console.error("ImageLightbox: Missing 'src' property.");
    return null;
  }

  const toggleLightbox = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div style={{textAlign: 'center'}}>
      <img
        src={src}
        alt={caption || 'Image'}
        style={{
          cursor: 'pointer',
          maxWidth: '100%',
          border: 'none',
          margin: '0 auto',
          ...style,
        }}
        onClick={toggleLightbox}
      />
      {caption && (
        <p
          style={{
            textAlign: 'center',
            marginTop: '-1.5rem',
            fontSize: '0.9rem',
            fontStyle: 'italic',
          }}
        >
          {caption}
        </p>
      )}

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
            alt={caption || 'Image'}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
              border: 'none',
              background: 'hsl(var(--background))',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
