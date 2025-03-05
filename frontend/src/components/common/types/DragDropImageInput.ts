export interface DragDropImageInputProps {
  imagePreview: string | null;
  onFileSelect: (file: File | null) => void;
} 