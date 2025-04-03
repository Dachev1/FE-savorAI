import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Inside your Recipe component's return statement, find a visible header area and add:
<div className="mb-6 flex items-center justify-between">
  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Recipes</h1>
  
  <Link
    to="/favorites"
    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
  >
    <FaHeart className="text-red-500" />
    <span className="font-medium">My Favorites</span>
  </Link>
</div> 