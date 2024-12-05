"use client";

import Image from "next/image";
import { FC } from "react";
import React, { useState } from "react";

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
  const aspectRatio = `${width} / ${height}`;

  const containerStyle = {
    width: "100%",
    height: "auto",
    aspectRatio: aspectRatio,
    margin: "3rem auto 4rem",
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClick = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div style={containerStyle}>
      <figure>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{ cursor: "pointer", width: "100%", height: "auto" }}
          onClick={handleClick}
        />
        {isFullscreen && (
          <div className="fullscreenContainer" onClick={handleClick}>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              style={{ width: "auto", height: "100px" }}
            />
          </div>
        )}
        <figcaption>{caption}</figcaption>
      </figure>
    </div>
  );
};

export default ResponsiveImage;
