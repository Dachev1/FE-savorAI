import React from 'react';

interface TextAreaProps {
  label: string;
  id: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  error?: string;
  placeholder?: string;
  onErrorClear?: () => void;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  id,
  value,
  setValue,
  error,
  placeholder,
  onErrorClear,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (error && newValue.trim() && onErrorClear) {
      onErrorClear();
    }
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={6}
        value={value}
        onChange={handleChange}
        className={`w-full px-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors
          ${error 
            ? 'border-red-500 focus:ring-red-400' 
            : value ? 'border-green-500 focus:ring-green-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          }
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300
        `}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;
