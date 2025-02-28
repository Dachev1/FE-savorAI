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
    <div className="flex flex-col items-center">
      <div
        className={`w-full border-2 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
          isDragging
            ? 'border-accent bg-blue-50'
            : 'border-dashed border-gray-300 hover:border-accent'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg mb-2 shadow-md transform hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <p className="text-secondary text-sm transition-colors">
            {isDragging ? 'Drop the image here...' : 'Drag & Drop an image, or click to select.'}
          </p>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {errorMessage && (
        <div className="mt-2 text-red-600 bg-red-100 border border-red-400 px-4 py-2 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default DragDropImageInput;
