import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface DragDropImageInputProps {
  imagePreview: string | null;
  onFileSelect: (file: File) => void;
}

const DragDropImageInput: React.FC<DragDropImageInputProps> = ({
  imagePreview,
  onFileSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onFileSelect(file);
      e.dataTransfer.clearData();
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
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
  );
};

export default DragDropImageInput;
