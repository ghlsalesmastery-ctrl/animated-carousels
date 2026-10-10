import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// ---------------------------------------------------------------------------
// THE INTERNET ANSWERS — visual system
// Change values here to restyle every slide at once.
// ---------------------------------------------------------------------------

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1350;

export const colors = {
  bg: '#060608',
  bgGlow: '#15161D',
  device: '#121217',
  deviceEdge: '#2A2A33',
  screen: '#0B0B0E',
  hairline: 'rgba(255,255,255,0.07)',
  surface: '#1C1C21', // incoming bubble / input fill
  surfaceHi: '#26262D',
  keyboardBg: '#141418',
  key: '#2C2C33',
  keyAlt: '#1F1F25',
  text: '#F3F3F6',
  textMuted: '#8C8C97',
  textDim: '#5A5A64',
  accent: '#3D7BFF', // outgoing bubble / send
  accentDeep: '#2A5FE0',
  gold: '#E6C27A', // editorial highlight, numbers, insights
  good: '#7FD6A4',
  warn: '#F08A6C',
};

export const fonts = {
  sans: 'Inter, system-ui, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
};

export const series = {
  name: 'THE INTERNET ANSWERS',
  issue: '001',
  contactName: 'The Internet',
  contactNote: 'Dramatized conversation',
};

let fontsLoaded = false;
export const ensureFonts = () => {
  if (fontsLoaded) return;
  fontsLoaded = true;
  loadFont({family: 'Inter', url: staticFile('fonts/Inter-Variable.woff2'), weight: '100 900'});
  loadFont({family: 'Instrument Serif', url: staticFile('fonts/instrument-serif-latin-400-normal.woff2'), weight: '400'});
  loadFont({family: 'Instrument Serif', url: staticFile('fonts/instrument-serif-latin-400-italic.woff2'), weight: '400', style: 'italic'});
};
