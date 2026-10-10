import {Config} from '@remotion/cli/config';

// Output defaults tuned for Instagram: H.264, yuv420p, high quality, AAC audio.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setCrf(16);
Config.setAudioCodec('aac');
Config.setConcurrency(4);
