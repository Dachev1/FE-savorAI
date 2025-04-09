import React, { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { DragDropImageInputProps } from '../types/DragDropImageInput';
import { motion, AnimatePresence } from 'framer-motion';

const DragDropImageInput: React.FC<DragDropImageInputProps> = ({
  imagePreview,
  onFileSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Reset upload progress when a new image is loaded
  useEffect(() => {
    if (imagePreview) {
      setIsUploading(false);
      setUploadProgress(100);
    }
  }, [imagePreview]);

  const validateFile = (file: File) => {
    const maxSizeMB = 5;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('❌ Invalid file type! Please upload an image (JPG, PNG, GIF, etc.)');
      return false;
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`❌ File too large! Maximum size is ${maxSizeMB}MB.`);
      return false;
    }
    
    setErrorMessage(null);
    return true;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      if (validateFile(file)) {
        simulateUploadProgress(file);
      }
      
      e.dataTransfer.clearData();
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];

      if (validateFile(file)) {
        simulateUploadProgress(file);
      }
    }
  };

  // Simulate upload progress to give better UX feedback
  const simulateUploadProgress = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Show progress animation before actually uploading
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 95) {
          clearInterval(interval);
          // Actually process the file once animation is near complete
          onFileSelect(file);
          return 95;
        }
        return newProgress;
      });
    }, 100);
  };

  // Image optimization hint
  const optimizationTip = !imagePreview && (
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
      💡 Tip: For best results, use images smaller than 5MB. PNG or JPG formats are recommended.
    </p>
  );

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
        } ${imagePreview ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
        style={{ cursor: 'pointer' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          aria-label="Upload image"
        />

        <AnimatePresence mode="wait">
          {imagePreview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="mx-auto max-h-64 rounded-lg shadow-md" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                <span className="text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
                  Click to change
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0H8m12 0a4 4 0 01-4-4v-4m0 0h16m-4-4h4a4 4 0 014 4m-24 0a4 4 0 014-4m0 0h8"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4 flex flex-col items-center text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">Drag and drop your image here, or click to select</p>
                <p className="mt-1">SVG, PNG, JPG or GIF (max 5MB)</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        )}
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-2 text-sm text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </motion.div>
      )}

      {optimizationTip}
    </div>
  );
};

export default React.memo(DragDropImageInput);
