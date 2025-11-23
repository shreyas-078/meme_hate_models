import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Sleep utility for simulating delays
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate unique ID
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Validate image file
export const isValidImage = (file) => {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return file && validTypes.includes(file.type);
};

// Download file utility
export const downloadFile = (data, filename, mimeType = "application/json") => {
  const blob = new Blob(
    [typeof data === "string" ? data : JSON.stringify(data, null, 2)],
    {
      type: mimeType,
    }
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
