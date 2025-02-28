import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

interface SuccessModalProps {
  message: string;
  recipeId?: string | null;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, recipeId, onClose }) => {
  const navigate = useNavigate();

  const handleViewPreview = () => {
    onClose();
    if (recipeId) {
      navigate(`/recipes/preview/${recipeId}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop (clicking it also closes the modal) */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      {/* Modal Content */}
      <div className="relative bg-white p-8 rounded-xl shadow-2xl transform transition-all duration-500 ease-out animate-modalIn">
        {/* Close Button (turns red on hover) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 focus:outline-none"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>
        <p className="text-green-600 text-xl font-bold text-center mb-4">
          {message}
        </p>
        {recipeId && (
          <button
            onClick={handleViewPreview}
            className="w-full py-2 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform transform hover:-translate-y-1"
          >
            View Preview
          </button>
        )}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-modalIn {
          animation: modalIn 0.5s forwards;
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;
