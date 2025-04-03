import React from 'react';

interface ProfileCardProps {
  label: string;
  value: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
    <div className="font-medium text-gray-800 dark:text-white">{value}</div>
  </div>
);

export default ProfileCard; 