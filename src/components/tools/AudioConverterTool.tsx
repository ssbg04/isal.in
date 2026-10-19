import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Play,
  Pause,
  Download,
  Volume2,
  Clock,
  Sparkles,
  AlertCircle,
  FileAudio,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  convertAudioFile,
  decodeAudioFromFile,
  type AudioConversionOptions,
  type AudioConversionResult,
  type AudioMetadata,
} from '../../services/audioConversionService';

export const AudioConverterTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<AudioConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Conversion options
  const [targetFormat, setTargetFormat] = useState<'audio/wav' | 'audio/webm' | 'audio/mp3'>('audio/wav');
  const [channels, setChannels] = useState<1 | 2>(2);
  const [gain, setGain] = useState<number>(1.0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (selectedFile: File) => {
    setErrorMsg(null);
    setResult(null);
    setFile(selectedFile);
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);

    try {
      const { metadata: meta } = await decodeAudioFromFile(selectedFile);
      setMetadata(meta);
      setTrimStart(0);
      setTrimEnd(Math.round(meta.durationSeconds * 10) / 10);
    } catch {
      setErrorMsg('Failed to decode audio. Please ensure the file is an audio or video file.');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const options: AudioConversionOptions = {
      targetFormat,
      channels,
      gain,
      startTime: trimStart > 0 ? trimStart : undefined,
      endTime: trimEnd > 0 && metadata && trimEnd < metadata.durationSeconds ? trimEnd : undefined,
    };

    try {
      const convResult = await convertAudioFile(file, options);
      setResult(convResult);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Audio conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
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
      {/* Hidden audio element for preview */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Drop zone if no file selected */}
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-700/80 hover:border-amber-500/60 rounded-3xl p-10 text-center cursor-pointer transition-all bg-neutral-900/40 hover:bg-neutral-900/70 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/mp4,video/webm,video/quicktime,.mp3,.wav,.ogg,.m4a,.flac,.aac"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-100">
            Upload Audio or Video Track
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Supports MP3, WAV, OGG, M4A, FLAC, AAC, or MP4/WebM videos for instant audio extraction.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono">
            <span>100% In-Browser & Private</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Card & Preview Player */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-100 truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h4>
                  <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                    <span>{formatBytes(file.size)}</span>
                    {metadata && (
                      <>
                        <span>•</span>
                        <span>{formatSeconds(metadata.durationSeconds)}</span>
                        <span>•</span>
                        <span>{metadata.sampleRate} Hz</span>
                        <span>•</span>
                        <span>{metadata.numberOfChannels === 1 ? 'Mono' : 'Stereo'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors shadow-sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play Preview'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setMetadata(null);
                  }}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                  title="Upload another audio file"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrubber / Progress */}
            {metadata && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                  <span>{formatSeconds(currentTime)}</span>
                  <span>{formatSeconds(metadata.durationSeconds)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={metadata.durationSeconds || 1}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCurrentTime(val);
                    if (audioRef.current) audioRef.current.currentTime = val;
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Conversion Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
            {/* Target Format */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Target Audio Format
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'audio/wav' as const, label: 'WAV', desc: 'Lossless' },
                  { id: 'audio/webm' as const, label: 'WebM', desc: 'Opus' },
                  { id: 'audio/mp3' as const, label: 'MP3', desc: 'Universal' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTargetFormat(fmt.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      targetFormat === fmt.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{fmt.label}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{fmt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Channels & Volume Boost */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Volume Boost: {Math.round(gain * 100)}%</span>
                </label>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={gain}
                onChange={(e) => setGain(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-400">Audio Channels:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setChannels(2)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      channels === 2 ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    Stereo (2.0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannels(1)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      channels === 1 ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    Mono (1.0)
                  </button>
                </div>
              </div>
            </div>

            {/* Time Trimmer */}
            {metadata && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audio Trim (Sec)</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] text-neutral-500">Start:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max={trimEnd}
                      value={trimStart}
                      onChange={(e) => setTrimStart(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] text-neutral-500">End:</span>
                    <input
                      type="number"
                      step="0.1"
                      min={trimStart}
                      max={metadata.durationSeconds}
                      value={trimEnd}
                      onChange={(e) =>
                        setTrimEnd(Math.min(metadata.durationSeconds, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConvert}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Processing Audio in Browser...' : 'Convert Audio Now'}</span>
            </button>
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
                    <span>Conversion Complete</span>
                  </span>
                  <h4 className="text-base font-bold text-neutral-100 mt-2">{result.filename}</h4>
                  <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                    <span>Format: <strong className="text-neutral-200">{result.format}</strong></span>
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
                  <span>Download Converted Audio</span>
                </a>
              </div>

              {/* Playback preview for converted audio */}
              <audio controls src={result.downloadUrl} className="w-full mt-2" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
