import React from 'react';
import {Composition} from 'remotion';
import {Slide1, SLIDE1_DURATION} from './slides/Slide1';
import {FPS, HEIGHT, WIDTH} from './theme';

// Each slide is its own composition → its own independently playable MP4.
export const Root: React.FC = () => (
  <>
    <Composition id="Slide1" component={Slide1} durationInFrames={SLIDE1_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
