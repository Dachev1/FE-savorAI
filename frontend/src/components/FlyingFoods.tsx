import React, { useMemo } from 'react';

interface FoodData {
  left: number;      // Horizontal position as a percentage
  delay: number;     // Animation delay in seconds
  duration: number;  // Animation duration in seconds
  emoji: string;     // The food emoji to render
}

// Expanded array of food emojis (30 items).
const FOOD_EMOJIS = [
  "🍪", "🍕", "🍔", "🌮", "🍣", "🍟", "🥗", "🍩", "🍦", "🍇",
  "🍜", "🍤", "🥪", "🍙", "🍛", "🍝", "🥘", "🍲", "🍱",
  "🥑", "🍉", "🍋", "🍓", "🍍", "🥦", "🥕", "🌽", "🍆", "🍎", "🍌"
];

// Number of food emojis to animate on screen.
const NUMBER_OF_FOODS = 20;

// Extracted keyframes for the flying animation.
const flyFoodKeyframes = `
  @keyframes flyFood {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    50% {
      transform: translateY(-50vh) rotate(360deg);
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) rotate(720deg);
      opacity: 0;
    }
  }
  .animate-flyFood {
    animation: flyFood linear infinite;
  }
`;

const FlyingFoods: React.FC = () => {
  // Generate random food data only once.
  const foodsData: FoodData[] = useMemo(() => {
    return Array.from({ length: NUMBER_OF_FOODS }).map(() => {
      const emoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
      return {
        left: Math.random() * 100,          // Random horizontal position (0% to 100%)
        delay: Math.random() * 10,            // Random delay up to 10 seconds
        duration: 15 + Math.random() * 10,    // Duration between 15 and 25 seconds
        emoji,
      };
    });
  }, []);

  return (
    <>
      {/* Fixed container covering the full viewport */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {foodsData.map((food, index) => (
          <div
            key={index}
            className="absolute text-4xl animate-flyFood"
            style={{
              left: `${food.left}%`,
              bottom: '-100px',                      // Start further below the viewport (footer)
              animationDelay: `${food.delay}s`,
              animationDuration: `${food.duration}s`,
            }}
          >
            {food.emoji}
          </div>
        ))}
      </div>
      <style>{flyFoodKeyframes}</style>
    </>
  );
};

export default FlyingFoods;
