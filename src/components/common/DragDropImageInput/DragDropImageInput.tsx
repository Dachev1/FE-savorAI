import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { DragDropImageInputProps } from '../types/DragDropImageInput';

const DragDropImageInput: React.FC<DragDropImageInputProps> = ({
  imagePreview,
  onFileSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('❌ Invalid file type! Please upload an image (JPG, PNG, GIF, etc.)');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      if (validateFile(file)) {
        onFileSelect(file);
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
        onFileSelect(file);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {imagePreview ? (
        <div className="w-full mb-4">
          <div className="relative w-full rounded-lg overflow-hidden shadow-md border border-gray-200">
            <img
              src={imagePreview}
              alt="Recipe preview"
              className="w-full max-h-96 object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={handleClickUpload}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Change image
          </button>
        </div>
      ) : (
        <div
          className={`w-full h-48 border-2 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
            isDragging
              ? 'border-accent bg-blue-50 dark:bg-blue-900/20'
              : 'border-dashed border-gray-300 hover:border-accent dark:border-gray-600 dark:hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
              {isDragging ? 'Drop the image here...' : 'Drag & Drop an image, or click to select.'}
            </p>
          </div>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {errorMessage && (
        <div className="mt-2 text-red-600 bg-red-100 border border-red-400 px-4 py-2 rounded-md text-sm w-full">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default DragDropImageInput;
