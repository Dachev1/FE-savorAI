import axios from './axiosConfig';

interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
}

const RecipeAPI = {
  /**
   * Get recipe feed with pagination and sorting options
   * @param page Page number (0-based)
   * @param size Page size
   * @param sortBy Sort option ('newest', 'popular', or 'comments')
   * @returns Paginated list of recipes for the feed
   */
  getRecipeFeed: async (page = 0, size = 10, sortBy = 'newest') => {
    try {
      const response = await axios.get(`/v1/recipes/feed?page=${page}&size=${size}&sort=${sortBy}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recipe feed:', error);
      throw error;
    }
  },

  /**
   * Method to get a recipe with author info
   */
  getRecipeDebug: async (id: string) => {
    try {
      const response = await axios.get(`/v1/recipes/debug/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recipe data:', error);
      throw error;
    }
  }
};

export default RecipeAPI; 