// Video Conversion & Transcoding Service via HTML5 Canvas, captureStream, and MediaRecorder

export interface VideoMetadata {
  durationSeconds: number;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface VideoTranscodeOptions {
  targetFormat: 'video/webm' | 'video/mp4';
  resolution: 'original' | '1080p' | '720p' | '480p' | '360p';
  playbackRate?: number; // 0.5, 1, 1.5, 2
  muteAudio?: boolean;
  fps?: number; // default 30
}

export interface VideoConversionResult {
  filename: string;
  blob: Blob;
  downloadUrl: string;
  sizeBytes: number;
  durationSeconds: number;
  width: number;
  height: number;
}

/** Get video dimensions and duration */
export function loadVideoMetadata(file: File): Promise<{ video: HTMLVideoElement; metadata: VideoMetadata }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(width, height) || 1;
      const aspectRatio = `${width / divisor}:${height / divisor}`;

      resolve({
        video,
        metadata: {
          durationSeconds: video.duration,
          width,
          height,
          aspectRatio,
        },
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video file. Format may be unsupported.'));
    };

    video.src = url;
  });
}

/** Capture a single frame snapshot at a specified timestamp */
export function captureVideoFrame(
  video: HTMLVideoElement,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Frame snapshot export failed'));
    }, format, 0.92);
  });
}

/** Transcode / compress video in-browser using HTML5 Canvas & MediaRecorder */
export async function transcodeVideoFile(
  file: File,
  options: VideoTranscodeOptions,
  onProgress?: (progressPercent: number) => void
): Promise<VideoConversionResult> {
  const { video, metadata } = await loadVideoMetadata(file);

  // Compute target dimensions
  let targetWidth = metadata.width;
  let targetHeight = metadata.height;

  if (options.resolution !== 'original') {
    const maxDimension =
      options.resolution === '1080p'
        ? 1080
        : options.resolution === '720p'
        ? 720
        : options.resolution === '480p'
        ? 480
        : 360;

    if (metadata.height > maxDimension) {
      targetWidth = Math.round((metadata.width * maxDimension) / metadata.height);
      targetHeight = maxDimension;
      // Dimensions must be even for video codecs
      if (targetWidth % 2 !== 0) targetWidth -= 1;
      if (targetHeight % 2 !== 0) targetHeight -= 1;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const fps = options.fps || 30;
  const canvasStream = canvas.captureStream(fps);

  // Audio track handling
  if (!options.muteAudio) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      dest.stream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
    } catch {
      // Audio capture might be blocked by browser CORS on local blob; continue video-only
    }
  }

  // Choose supported MIME type
  let mimeType = 'video/webm;codecs=vp9,opus';
  let ext = 'webm';

  if (options.targetFormat === 'video/mp4') {
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')) {
      mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
      ext = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
      ext = 'mp4';
    } else {
      mimeType = 'video/webm;codecs=vp8,opus';
      ext = 'webm';
    }
  } else {
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      mimeType = 'video/webm;codecs=vp9,opus';
      ext = 'webm';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      mimeType = 'video/webm;codecs=vp8,opus';
      ext = 'webm';
    } else {
      mimeType = 'video/webm';
      ext = 'webm';
    }
  }

  const recorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond: options.resolution === '1080p' ? 5000000 : options.resolution === '720p' ? 2500000 : 1200000,
  });

  const chunks: Blob[] = [];
  video.playbackRate = options.playbackRate || 1.0;

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const resultBlob = new Blob(chunks, { type: mimeType });
      const originalBase = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${originalBase}-converted.${ext}`;
      const downloadUrl = URL.createObjectURL(resultBlob);

      resolve({
        filename,
        blob: resultBlob,
        downloadUrl,
        sizeBytes: resultBlob.size,
        durationSeconds: metadata.durationSeconds,
        width: targetWidth,
        height: targetHeight,
      });
    };

    recorder.onerror = () => reject(new Error('Video transcoding recorder error'));

    // Start recording & rendering loop
    recorder.start(100);
    video.currentTime = 0;
    video.muted = !!options.muteAudio;

    let animId = 0;
    const renderLoop = () => {
      if (!video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        if (metadata.durationSeconds > 0 && onProgress) {
          const pct = Math.min(99, Math.round((video.currentTime / metadata.durationSeconds) * 100));
          onProgress(pct);
        }
        animId = requestAnimationFrame(renderLoop);
      }
    };

    video.onplay = () => {
      animId = requestAnimationFrame(renderLoop);
    };

    video.onended = () => {
      cancelAnimationFrame(animId);
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      if (onProgress) onProgress(100);
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 200);
    };

    video.play().catch((err) => reject(new Error(`Video playback error: ${err.message}`)));
  });
}
