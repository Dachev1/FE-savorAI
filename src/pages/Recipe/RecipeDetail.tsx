import React from 'react';
import { useParams } from 'react-router-dom';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Recipe Details</h1>
      <p className="mb-4">Viewing recipe ID: {id}</p>
    </div>
  );
};

export default RecipeDetail; 