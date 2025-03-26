import React, { useMemo } from 'react';

interface FoodData {
  left: number;      // Horizontal position as a percentage
  delay: number;     // Animation delay in seconds
  duration: number;  // Animation duration in seconds
  emoji: string;     // The food emoji to render
}

interface FlyingFoodsProps {
  count?: number;    // Optional parameter to control number of food items
}

// Expanded array of food emojis (30 items).
const FOOD_EMOJIS = [
  "🍪", "🍕", "🍔", "🌮", "🍣", "🍟", "🥗", "🍩", "🍦", "🍇",
  "🍜", "🍤", "🥪", "🍙", "🍛", "🍝", "🥘", "🍲", "🍱",
  "🥑", "🍉", "🍋", "🍓", "🍍", "🥦", "🥕", "🌽", "🍆", "🍎", "🍌"
];

// Default number of food emojis to animate on screen.
const DEFAULT_NUMBER_OF_FOODS = 10;

// Extracted keyframes for the flying animation.
const flyFoodKeyframes = `
  @keyframes flyFood {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 0.7;
    }
    50% {
      transform: translateY(-50vh) rotate(180deg);
      opacity: 0.7;
    }
    100% {
      transform: translateY(-100vh) rotate(360deg);
      opacity: 0;
    }
  }
  .animate-flyFood {
    animation: flyFood linear infinite;
  }
`;

const FlyingFoods: React.FC<FlyingFoodsProps> = ({ count = DEFAULT_NUMBER_OF_FOODS }) => {
  // Generate random food data only once.
  const foodsData: FoodData[] = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const emoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
      return {
        left: Math.random() * 100,            // Random horizontal position (0% to 100%)
        delay: Math.random() * 15,            // Random delay up to 15 seconds
        duration: 20 + Math.random() * 15,    // Duration between 20 and 35 seconds (slower)
        emoji,
      };
    });
  }, [count]);

  return (
    <>
      {/* Fixed container covering the full viewport */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {foodsData.map((food, index) => (
          <div
            key={index}
            className="absolute text-3xl animate-flyFood opacity-50 dark:opacity-40"
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
