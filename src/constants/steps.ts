export interface Step {
    id: number;
    title: string;
    description: string;
  }
  
  export const LEARN_MORE_STEPS: Step[] = [
    {
      id: 1,
      title: 'Inventory Insights',
      description: 'Enter the ingredients in your kitchen, and SavorAI will generate creative recipes tailored just for you.',
    },
    {
      id: 2,
      title: 'Your Preferences, Your Way',
      description: 'Customize recipes based on dietary needs, cuisines, or your unique preferences.',
    },
    {
      id: 3,
      title: 'Cook Like a Pro',
      description: 'Follow intuitive step-by-step instructions, complete with visuals and nutritional facts.',
    },
  ];
  