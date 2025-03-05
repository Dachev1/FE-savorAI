import axios from './axiosConfig';
import { RecipeResponse as Recipe, IRecipeFormData as RecipeForm } from '../types';
import { User, RegisterData, LoginData } from '../types/auth';

// Auth API
export const authAPI = {
  login: async (data: LoginData) => {
    const response = await axios.post('/api/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterData) => {
    const response = await axios.post('/api/auth/register', data);
    return response.data;
  },
  
  logout: async () => {
    const response = await axios.post('/api/auth/logout');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await axios.get('/api/user/profile');
    return response.data as User;
  },
};

// Recipe API
export const recipeAPI = {
  getAllRecipes: async (params?: { 
    tags?: string[],
    query?: string,
    page?: number,
    limit?: number
  }) => {
    const response = await axios.get('/api/recipes', { params });
    return response.data;
  },
  
  getRecipeById: async (id: string) => {
    const response = await axios.get(`/api/recipes/${id}`);
    return response.data as Recipe;
  },
  
  createRecipe: async (data: RecipeForm) => {
    const response = await axios.post('/api/recipes', data);
    return response.data;
  },
  
  updateRecipe: async (id: string, data: RecipeForm) => {
    const response = await axios.put(`/api/recipes/${id}`, data);
    return response.data;
  },
  
  deleteRecipe: async (id: string) => {
    const response = await axios.delete(`/api/recipes/${id}`);
    return response.data;
  },
  
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post('/api/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

// User preferences API
export const preferencesAPI = {
  getAllergens: async () => {
    const response = await axios.get('/api/user/allergens');
    return response.data;
  },
  
  updateAllergens: async (allergens: string[]) => {
    const response = await axios.put('/api/user/allergens', { allergens });
    return response.data;
  },
  
  getDietaryPreferences: async () => {
    const response = await axios.get('/api/user/dietary-preferences');
    return response.data;
  },
  
  updateDietaryPreferences: async (preferences: string[]) => {
    const response = await axios.put('/api/user/dietary-preferences', { preferences });
    return response.data;
  },
};

export default {
  auth: authAPI,
  recipes: recipeAPI,
  preferences: preferencesAPI,
}; 