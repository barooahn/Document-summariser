'use client';

import React from 'react';
import ReactPlayer from 'react-player';

export default function VideoPlayer() {
  return (
    <ReactPlayer
      playing
      controls={true}
      light={true}
      url={[{ src: 'chat-clause.mp4', type: 'video/mp4' }]}
    />
  );
}
