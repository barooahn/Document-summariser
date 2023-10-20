'use client';

import React from 'react';
import ReactPlayer from 'react-player';

export default function VideoPlayer() {
  return (
    <div className="relative" style={{ paddingTop: '56.25%' }}>
      <ReactPlayer
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        playing
        controls={true}
        light={<img src="video-thumb.jpg" alt="Thumbnail" />}
        url={[{ src: 'chat-clause.mp4', type: 'video/mp4' }]}
      />
    </div>
  );
}
