import type { MediaType } from "src/utils/fetch/fetchapi";
const supportedMedia = ["mp4", "webm", "mov", "mkv", "avi", "mp3", "mpeg", "wav", "ogg", "aac", "flac", "png", "jpeg", "jpg", "gif", "webp", "bmp", "svg"]
const maxFileSize = 100 * 1024 * 1024
const maxSizeText = maxFileSize / 1024 / 1024
const mediaText = supportedMedia.join(", ")
const mediaAccept = ("." + supportedMedia.join(",."))// agregar . para todos//mediaAccept mp4,.webm,.mov,.mkv,.avi,.mp3,.mpeg,.wav,.ogg,.aac,.flac,.png,.jpeg,.jpg,.gif,.webp,.bmp,.svg
const detectMediaType = (file: File): MediaType | null => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (["png", "jpeg", "jpg", "gif", "webp", "bmp", "svg"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "mkv", "avi"].includes(ext)) return "video";
  if (["mp3", "mpeg", "wav", "ogg", "aac", "flac"].includes(ext)) return "audio";
  return null;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};
console.log("mediaAccept", mediaAccept)
export { supportedMedia, maxFileSize, mediaText, detectMediaType, maxSizeText, mediaAccept, formatFileSize }