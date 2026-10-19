import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Download,
  Camera,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Check,
  VolumeX,
  Gauge,
} from 'lucide-react';
import {
  loadVideoMetadata,
  captureVideoFrame,
  transcodeVideoFile,
  type VideoMetadata,
  type VideoTranscodeOptions,
  type VideoConversionResult,
} from '../../services/videoConversionService';

export const VideoConverterTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [result, setResult] = useState<VideoConversionResult | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings
  const [targetFormat, setTargetFormat] = useState<'video/webm' | 'video/mp4'>('video/webm');
  const [resolution, setResolution] = useState<'original' | '1080p' | '720p' | '480p' | '360p'>('original');
  const [muteAudio, setMuteAudio] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (selectedFile: File) => {
    setErrorMsg(null);
    setResult(null);
    setSnapshotUrl(null);
    setFile(selectedFile);
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);

    try {
      const { metadata: meta } = await loadVideoMetadata(selectedFile);
      setMetadata(meta);
    } catch {
      setErrorMsg('Failed to load video metadata. Format may be unsupported by the browser.');
    }
  };

  const handleTranscode = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgressPercent(0);
    setErrorMsg(null);

    const options: VideoTranscodeOptions = {
      targetFormat,
      resolution,
      muteAudio,
      playbackRate,
    };

    try {
      const convResult = await transcodeVideoFile(file, options, (pct) => {
        setProgressPercent(pct);
      });
      setResult(convResult);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Video transcoding failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakeSnapshot = async () => {
    if (!videoRef.current) return;
    try {
      const blob = await captureVideoFrame(videoRef.current, 'image/png');
      const url = URL.createObjectURL(blob);
      setSnapshotUrl(url);
    } catch {
      setErrorMsg('Failed to capture frame snapshot.');
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-700/80 hover:border-amber-500/60 rounded-3xl p-10 text-center cursor-pointer transition-all bg-neutral-900/40 hover:bg-neutral-900/70 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.webm,.mov,.mkv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-100">
            Upload Video File
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Supports MP4, WebM, MOV, and MKV for client-side transcoding, compression & frame snapshots.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono">
            <span>Client-Side Stream Processing</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Video Preview and Live Snapshot */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-neutral-100 truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h4>
                <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                  <span>{formatBytes(file.size)}</span>
                  {metadata && (
                    <>
                      <span>•</span>
                      <span>{metadata.width} &times; {metadata.height}</span>
                      <span>•</span>
                      <span>{formatSeconds(metadata.durationSeconds)}</span>
                      <span>•</span>
                      <span>Aspect: {metadata.aspectRatio}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTakeSnapshot}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
                  title="Capture current video frame as high-res PNG"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Snapshot Frame</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setMetadata(null);
                    setSnapshotUrl(null);
                  }}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                  title="Upload another video"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            {videoUrl && (
              <div className="relative rounded-xl overflow-hidden bg-black max-h-96 flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  playsInline
                  className="w-full max-h-96 object-contain"
                />
              </div>
            )}

            {/* Snapshot preview if captured */}
            {snapshotUrl && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-3">
                  <img
                    src={snapshotUrl}
                    alt="Frame Snapshot"
                    className="w-16 h-10 object-cover rounded-lg border border-neutral-700"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-200">Frame Snapshot Captured</div>
                    <div className="text-[10px] text-neutral-500">Lossless 32-bit PNG</div>
                  </div>
                </div>
                <a
                  href={snapshotUrl}
                  download="frame-snapshot.png"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Image</span>
                </a>
              </div>
            )}
          </div>

          {/* Transcoding Settings Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
            {/* Target Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Target Format
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTargetFormat('video/webm')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    targetFormat === 'video/webm'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  WebM (VP9)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFormat('video/mp4')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    targetFormat === 'video/mp4'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  MP4
                </button>
              </div>
            </div>

            {/* Resolution Scaling */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Resolution Scaling
              </label>
              <select
                value={resolution}
                onChange={(e) =>
                  setResolution(e.target.value as 'original' | '1080p' | '720p' | '480p' | '360p')
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-medium text-neutral-200 outline-none focus:border-amber-500"
              >
                <option value="original">Original ({metadata ? `${metadata.width}x${metadata.height}` : 'Native'})</option>
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
                <option value="360p">360p Mobile</option>
              </select>
            </div>

            {/* Speed */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Speed</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setPlaybackRate(rate)}
                    className={`py-1.5 text-xs rounded-lg font-mono transition-colors ${
                      playbackRate === rate
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Track */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Audio Option
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={muteAudio}
                  onChange={(e) => setMuteAudio(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-neutral-900 border-neutral-700"
                />
                <span className="text-xs text-neutral-300 flex items-center gap-1.5">
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Mute Audio Track</span>
                </span>
              </label>
            </div>
          </div>

          {/* Action Button & Live Progress */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleTranscode}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Transcoding Video Stream...' : 'Transcode Video Now'}</span>
            </button>

            {isProcessing && (
              <div className="space-y-1.5 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
                <div className="flex justify-between text-xs font-mono text-neutral-300">
                  <span>Transcoding in progress...</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="bg-gradient-to-br from-amber-950/40 via-neutral-900/80 to-neutral-950 border border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                    <Check className="w-3.5 h-3.5" />
                    <span>Transcoding Complete</span>
                  </span>
                  <h4 className="text-base font-bold text-neutral-100 mt-2">{result.filename}</h4>
                  <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                    <span>
                      Resolution: <strong className="text-neutral-200">{result.width} &times; {result.height}</strong>
                    </span>
                    <span>•</span>
                    <span>Size: <strong className="text-neutral-200">{formatBytes(result.sizeBytes)}</strong></span>
                  </div>
                </div>

                <a
                  href={result.downloadUrl}
                  download={result.filename}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Transcoded Video</span>
                </a>
              </div>

              <div className="rounded-xl overflow-hidden bg-black max-h-80 flex items-center justify-center">
                <video controls src={result.downloadUrl} className="w-full max-h-80 object-contain" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
