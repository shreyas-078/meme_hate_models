import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { isValidImage } from "../lib/utils";

const UploadDropzone = ({
  onFileSelect,
  maxSize = 5 * 1024 * 1024,
  accept = "image/*",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    (file) => {
      setError(null);

      // Validate file type
      if (!isValidImage(file)) {
        setError("Please upload a valid image file (JPG, PNG, GIF, or WebP)");
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setError(
          `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
        );
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onFileSelect(file, reader.result);
      };
      reader.readAsDataURL(file);
    },
    [maxSize, onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  }, []);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-12 transition-all",
              "hover:border-primary/50 hover:bg-primary/5",
              isDragging
                ? "border-primary bg-primary/10 scale-105"
                : "border-gray-600",
              error && "border-red-500/50"
            )}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{
                  y: isDragging ? -10 : 0,
                  scale: isDragging ? 1.1 : 1,
                }}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  "glass-panel",
                  isDragging ? "bg-primary/20 border-primary" : ""
                )}
              >
                <Upload
                  className={cn(
                    "w-8 h-8",
                    isDragging ? "text-primary" : "text-gray-400"
                  )}
                />
              </motion.div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {isDragging ? "Drop your image here" : "Upload an image"}
              </h3>

              <p className="text-sm text-gray-400 mb-4">
                Drag and drop or click to browse
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>JPG, PNG, GIF, WebP</span>
                <span>•</span>
                <span>Max {Math.round(maxSize / 1024 / 1024)}MB</span>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <p className="text-sm text-red-400 text-center">{error}</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative glass-panel rounded-2xl p-4 border border-green-500/30"
          >
            <div className="flex items-start gap-4">
              {/* Preview Image */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <h4 className="text-sm font-medium text-white truncate">
                      {selectedFile.name}
                    </h4>
                  </div>
                  <button
                    onClick={handleRemove}
                    className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                  <span>•</span>
                  <span>{selectedFile.type}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadDropzone;
