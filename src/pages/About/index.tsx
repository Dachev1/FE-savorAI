import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About SavorAI</h1>
      <p className="mb-4">
        SavorAI is an innovative recipe generation platform that uses artificial intelligence to create personalized recipes based on your preferences, dietary restrictions, and available ingredients.
      </p>
      <p className="mb-4">
        Our mission is to make healthy, delicious cooking accessible to everyone, regardless of their culinary expertise or time constraints.
      </p>
      <h2 className="text-2xl font-bold mt-8 mb-4">Our Features</h2>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">AI-powered recipe generation</li>
        <li className="mb-2">Personalized dietary recommendations</li>
        <li className="mb-2">Allergen and ingredient filtering</li>
        <li className="mb-2">Nutritional information and analysis</li>
        <li className="mb-2">Recipe saving and sharing</li>
      </ul>
    </div>
  );
};

export default About; 