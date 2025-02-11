import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  message: string;
  recipeId?: string | null;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, recipeId }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      {/* Modal */}
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-green-400 transform transition-all duration-500 ease-out animate-modalIn">
        <p className="text-green-600 text-xl font-bold text-center">{message}</p>
        {recipeId && (
          <button
            onClick={() => navigate(`/recipes/${recipeId}`)}
            className="mt-4 w-full py-2 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform transform hover:-translate-y-1"
          >
            View Post
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessModal;
