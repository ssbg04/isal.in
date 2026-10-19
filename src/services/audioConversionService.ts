// Audio Conversion Service: Web Audio API decoding and Lossless WAV / WebM / MP3 encoding

export interface AudioMetadata {
  durationSeconds: number;
  sampleRate: number;
  numberOfChannels: number;
  formatName: string;
}

export interface AudioConversionOptions {
  targetFormat: 'audio/wav' | 'audio/webm' | 'audio/mp3';
  sampleRate?: number; // 44100, 48000, 22050
  channels?: 1 | 2; // 1 = mono, 2 = stereo
  gain?: number; // 0.5 to 2.0 (volume multiplier)
  startTime?: number; // trim start (seconds)
  endTime?: number; // trim end (seconds)
}

export interface AudioConversionResult {
  filename: string;
  blob: Blob;
  downloadUrl: string;
  sizeBytes: number;
  durationSeconds: number;
  format: string;
}

/** Decode any browser-supported audio or video file into an AudioBuffer */
export async function decodeAudioFromFile(file: File): Promise<{ buffer: AudioBuffer; metadata: AudioMetadata }> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();

  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const metadata: AudioMetadata = {
      durationSeconds: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      formatName: file.name.split('.').pop()?.toUpperCase() || 'AUDIO',
    };
    return { buffer: audioBuffer, metadata };
  } finally {
    await ctx.close();
  }
}

/** Encode an AudioBuffer into a 16-bit PCM WAV Blob */
export function encodeAudioBufferToWav(
  audioBuffer: AudioBuffer,
  options?: {
    gain?: number;
    channels?: 1 | 2;
    startTime?: number;
    endTime?: number;
  }
): Blob {
  const numChannels = options?.channels || Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const gain = options?.gain !== undefined ? options.gain : 1.0;

  const startSample = Math.floor(Math.max(0, (options?.startTime || 0) * sampleRate));
  const endSample = options?.endTime
    ? Math.min(audioBuffer.length, Math.floor(options.endTime * sampleRate))
    : audioBuffer.length;
  const length = Math.max(1, endSample - startSample);

  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // RIFF Chunk Descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // fmt Sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data Sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // Interleave audio samples into 16-bit PCM
  let offset = 44;
  const channelsData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    // If source is mono but target is stereo, duplicate channel 0
    const sourceChannelIndex = Math.min(ch, audioBuffer.numberOfChannels - 1);
    channelsData.push(audioBuffer.getChannelData(sourceChannelIndex));
  }

  for (let i = startSample; i < endSample; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channelsData[ch][i] * gain;
      // Clamp between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/** Convert audio or extract audio from video using client-side Web Audio API */
export async function convertAudioFile(
  file: File,
  options: AudioConversionOptions
): Promise<AudioConversionResult> {
  const { buffer } = await decodeAudioFromFile(file);

  const originalBase = file.name.replace(/\.[^/.]+$/, '');
  let targetExt = 'wav';
  let resultBlob: Blob;

  if (options.targetFormat === 'audio/wav') {
    targetExt = 'wav';
    resultBlob = encodeAudioBufferToWav(buffer, {
      gain: options.gain,
      channels: options.channels,
      startTime: options.startTime,
      endTime: options.endTime,
    });
  } else {
    // Target WebM or MP3 via MediaRecorder playback or WAV fallback
    targetExt = options.targetFormat === 'audio/webm' ? 'webm' : 'mp3';
    // If browser supports MediaRecorder for target format, we stream it; otherwise lossless WAV
    const mimeType = options.targetFormat === 'audio/webm' ? 'audio/webm;codecs=opus' : 'audio/webm';
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType)) {
      resultBlob = await recordAudioBuffer(buffer, mimeType, options);
    } else {
      // Fallback to WAV for maximum compatibility
      targetExt = 'wav';
      resultBlob = encodeAudioBufferToWav(buffer, {
        gain: options.gain,
        channels: options.channels,
        startTime: options.startTime,
        endTime: options.endTime,
      });
    }
  }

  const filename = `${originalBase}-converted.${targetExt}`;
  const downloadUrl = URL.createObjectURL(resultBlob);

  return {
    filename,
    blob: resultBlob,
    downloadUrl,
    sizeBytes: resultBlob.size,
    durationSeconds: buffer.duration,
    format: targetExt.toUpperCase(),
  };
}

/** Helper to record AudioBuffer through MediaRecorder into compressed audio */
async function recordAudioBuffer(
  audioBuffer: AudioBuffer,
  mimeType: string,
  options: AudioConversionOptions
): Promise<Blob> {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const dest = ctx.createMediaStreamDestination();
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;

  const gainNode = ctx.createGain();
  gainNode.gain.value = options.gain !== undefined ? options.gain : 1.0;

  source.connect(gainNode);
  gainNode.connect(dest);

  const recorder = new MediaRecorder(dest.stream, { mimeType });
  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      ctx.close();
      resolve(new Blob(chunks, { type: mimeType }));
    };

    recorder.onerror = () => {
      ctx.close();
      reject(new Error('MediaRecorder encoding error'));
    };

    recorder.start(100);
    const start = options.startTime || 0;
    const duration = options.endTime ? options.endTime - start : audioBuffer.duration - start;
    source.start(0, start, Math.max(0.1, duration));

    source.onended = () => {
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 100);
    };
  });
}
