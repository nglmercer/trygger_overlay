/**
 * FFmpeg Video Analyzer
 * Uses @ffmpeg/ffmpeg 0.12.x to analyze video files for audio and subtitle tracks
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Track interfaces
export interface AudioTrack {
  id: string;
  name: string;
  language: string;
  codec: string;
  selected: boolean;
}

export interface SubtitleTrack {
  id: string;
  name: string;
  language: string;
  codec: string;
  selected: boolean;
}

export interface VideoAnalysis {
  hasVideo: boolean;
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
}

// FFprobe-like output interfaces
interface FFprobeStream {
  index: number;
  codec_name?: string;
  codec_long_name?: string;
  codec_type?: string;
  language?: string;
  title?: string;
  tags?: Record<string, string>;
}

interface FFprobeFormat {
  format_name?: string;
  duration?: string;
  size?: string;
  bit_rate?: string;
  tags?: Record<string, string>;
}

interface FFprobeOutput {
  streams?: FFprobeStream[];
  format?: FFprobeFormat;
}

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

// FFmpeg core version - must match package.json dependency
const FFmpeg_VERSION = "0.12.10";

/**
 * Get file extension for FFmpeg virtual filesystem
 */
export const getFileExtension = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const extMap: Record<string, string> = {
    "mp4": ".mp4",
    "m4v": ".mp4",
    "mkv": ".mkv",
    "webm": ".webm",
    "avi": ".avi",
    "mov": ".mov",
    "mpg": ".mpg",
    "mpeg": ".mpeg"
  };
  return extMap[ext] || ".mp4";
};

/**
 * Map ISO 639-2 language codes to ISO 639-1
 */
export const mapLanguageCode = (iso6392: string): string => {
  const languageMap: Record<string, string> = {
    "eng": "en",
    "spa": "es",
    "por": "pt",
    "fra": "fr",
    "deu": "de",
    "ita": "it",
    "jpn": "ja",
    "chi": "zh",
    "kor": "ko",
    "rus": "ru",
    "ara": "ar",
    "hin": "hi",
    "und": "und"
  };
  
  return languageMap[iso6392?.toLowerCase() || ""] || iso6392?.toLowerCase() || "und";
};

/**
 * Load FFmpeg module and core
 * Throws error if FFmpeg is not available
 */
export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (ffmpegLoadPromise) {
    return ffmpegLoadPromise;
  }

  ffmpegLoadPromise = (async () => {
    const ffmpeg = new FFmpeg();

    // Set up logger to capture output
    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    // Load FFmpeg core using @ffmpeg/util
    const baseURL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFmpeg_VERSION}/dist/esm`;
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return ffmpegLoadPromise;
};

/**
 * Get FFmpeg instance, loading if necessary
 */
export const getFFmpeg = async (): Promise<FFmpeg> => {
  return loadFFmpeg();
};

/**
 * Write file to FFmpeg virtual filesystem
 */
const writeFileToFFmpeg = async (ffmpeg: FFmpeg, file: File): Promise<string> => {
  const inputName = "input" + getFileExtension(file.name);
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  return inputName;
};

/**
 * Delete file from FFmpeg virtual filesystem
 */
const deleteFileFromFFmpeg = async (ffmpeg: FFmpeg, fileName: string): Promise<void> => {
  try {
    await ffmpeg.deleteFile(fileName);
  } catch (e) {
    console.warn(`Error deleting file ${fileName}:`, e);
  }
};

/**
 * Analyze video file using FFmpeg's native probe capabilities
 * This uses FFmpeg's -i command to get real track info
 */
export const analyzeVideoFile = async (file: File): Promise<VideoAnalysis> => {
  const result: VideoAnalysis = {
    hasVideo: false,
    audioTracks: [],
    subtitleTracks: []
  };

  // Load FFmpeg - throws if not available
  const ffmpeg = await loadFFmpeg();
  
  // Write file to virtual filesystem
  const inputName = await writeFileToFFmpeg(ffmpeg, file);

  try {
    // Run FFmpeg to get file information - use JSON output for reliable parsing
    let logOutput = "";
    
    // Create a custom log handler to capture the output
    const logHandler = ({ message }: { message: string }) => {
      logOutput += message + "\n";
    };
    
    ffmpeg.on('log', logHandler);
    
    try {
      // Get file info without processing (just -i with hide_banner)
      await ffmpeg.exec([
        '-hide_banner',
        '-i', inputName
      ]);
    } finally {
      // Remove the custom log handler
      ffmpeg.off('log', logHandler);
    }
    
    // Parse the log output for stream information
    const probeData = parseFFmpegLog(logOutput);
    
    if (probeData && probeData.streams) {
      let audioTrackId = 1;
      let subtitleTrackId = 1;
      
      for (const stream of probeData.streams) {
        // Check if this is a video stream
        if (stream.codec_type === "video" && !result.hasVideo) {
          result.hasVideo = true;
        }
        
        // Check if this is an audio stream
        if (stream.codec_type === "audio") {
          // Extract language from tags or language field (ffprobe uses ISO 639-2 codes)
          const langCode = stream.tags?.language || stream.language || "und";
          const language = mapLanguageCode(langCode);
          const codec = stream.codec_name || "";
          const trackTitle = stream.tags?.title || `Track ${audioTrackId}`;
          
          result.audioTracks.push({
            id: `audio-${audioTrackId}`,
            name: trackTitle,
            language: language,
            codec: codec,
            selected: true
          });
          audioTrackId++;
        }
        
        // Check if this is a subtitle stream
        if (stream.codec_type === "subtitle") {
          // Extract language from tags or language field (ffprobe uses ISO 639-2 codes)
          const langCode = stream.tags?.language || stream.language || "und";
          const language = mapLanguageCode(langCode);
          const codec = stream.codec_name || "";
          const trackTitle = stream.tags?.title || `Track ${subtitleTrackId}`;
          
          result.subtitleTracks.push({
            id: `sub-${subtitleTrackId}`,
            name: trackTitle,
            language: language,
            codec: codec,
            selected: true
          });
          subtitleTrackId++;
        }
      }
    }
    
    // If no streams detected, assume there's video and mark as such
    if (!result.hasVideo && result.audioTracks.length === 0 && result.subtitleTracks.length === 0) {
      result.hasVideo = true;
    }

  } finally {
    // Clean up - delete file from virtual filesystem
    await deleteFileFromFFmpeg(ffmpeg, inputName);
  }

  return result;
};

/**
 * Parse FFmpeg log output to extract stream information
 */
const parseFFmpegLog = (logOutput: string): FFprobeOutput => {
  const streams: FFprobeStream[] = [];
  
  // Pattern to match stream info in FFmpeg output
  // Stream #0:0 -> Video, Stream #0:1 -> Audio, etc.
  // Examples:
  // "Stream #0:0: Video: h264 (High), yuv420p(progressive)"
  // "Stream #0:1(eng): Audio: aac (LC), 48000 Hz, 5.1"
  // "Stream #0:2(spa): Subtitle: mov_text"
  const streamPattern = /Stream\s+#(\d+):(\d+)(?:\(([a-z]{3})\))?:\s*(Video|Audio|Subtitle|Data):\s*(.+)/i;
  const codecPattern = /([a-zA-Z0-9_]+)/;
  const titlePattern = /title\s*[=:]\s*([^,]+)/i;
  
  const lines = logOutput.split('\n');
  
  for (const line of lines) {
    const match = line.match(streamPattern);
    if (match) {
      const [, , index, langCode, type, info] = match;
      const streamNum = parseInt(index);
      
      // Extract codec info
      const codecMatch = info.match(codecPattern);
      const codecName = codecMatch ? codecMatch[1] : undefined;
      
      // Try to extract title from info
      const titleMatch = info.match(titlePattern);
      const title = titleMatch ? titleMatch[1].trim() : undefined;
      
      // Convert language code
      const language = langCode ? mapLanguageCode(langCode) : "und";
      
      streams.push({
        index: streamNum,
        codec_name: codecName,
        codec_type: type.toLowerCase(),
        language: language,
        title: title,
        tags: title ? { title, language: langCode } : { language: langCode }
      });
    }
  }
  
  // Also try to detect format info from the log
  const formatMatch = logOutput.match(/Input #0,\s*([^,]+),/);
  const format: FFprobeFormat = {
    format_name: formatMatch ? formatMatch[1] : undefined
  };
  
  return { streams, format };
};

/**
 * Check if FFmpeg is available
 * Returns true if FFmpeg can be loaded, false otherwise
 */
export const isFFmpegAvailable = async (): Promise<boolean> => {
  try {
    await loadFFmpeg();
    return true;
  } catch (e) {
    console.warn("FFmpeg not available:", e);
    return false;
  }
};

/**
 * Unload FFmpeg to free resources
 */
export const unloadFFmpeg = async (): Promise<void> => {
  if (ffmpegInstance) {
    try {
      await ffmpegInstance.terminate();
    } catch (e) {
      console.warn("Error terminating FFmpeg:", e);
    }
    ffmpegInstance = null;
    ffmpegLoadPromise = null;
  }
};
