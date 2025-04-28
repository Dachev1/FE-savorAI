import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface BannedUserNoticeProps {
  username?: string;
}

const BannedUserNotice: React.FC<BannedUserNoticeProps> = ({ username }) => {
  return (
    <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
            Account Restricted
          </h3>
          <div className="mt-2 text-red-700 dark:text-red-300">
            <p>
              {username ? `Hello ${username}, ` : ''}Your account has been restricted by a site administrator.
            </p>
            <p className="mt-2">
              During this period, you may not be able to access certain features or content.
              If you believe this is in error, please contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannedUserNotice; 