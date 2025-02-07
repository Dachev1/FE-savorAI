import React from 'react';

interface TextAreaProps {
  label: string;
  id: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  error?: string;
  placeholder?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  id,
  value,
  setValue,
  error,
  placeholder,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-sm font-medium transition-colors ${
          value ? 'text-accent' : 'text-secondary'
        }`}
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`mt-1 w-full px-4 py-3 rounded-lg border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {error && <p className="mt-2 text-sm text-red-500 animate-pulse">{error}</p>}
    </div>
  );
};

export default TextArea;
