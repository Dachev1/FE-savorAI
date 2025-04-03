import React from 'react';
import { motion } from 'framer-motion';

interface TabContainerProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
}

const TabContainer: React.FC<TabContainerProps> = ({ children, title, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center mb-6">
      {icon && <div className="mr-3 text-blue-500">{icon}</div>}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </motion.div>
);

export default TabContainer; 