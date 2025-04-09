// Service configurations - use proper ports for each service
export const API_CONFIG = {
  USER_SERVICE: 'http://localhost:8081',
  RECIPE_SERVICE: 'http://localhost:8082'
};

// Each service's API paths
export const API_PATHS = {
  // Auth endpoints (User Service - 8081)
  AUTH: {
    SIGNIN: '/api/v1/auth/signin',
    SIGNUP: '/api/v1/auth/signup',
    LOGOUT: '/api/v1/auth/logout',
    PROFILE: '/api/v1/profile',
    CHECK_STATUS: '/api/v1/auth/check-status',
    VERIFY: '/api/v1/auth/verify'
  },
  
  // User endpoints (User Service - 8081)
  USER: {
    PROFILE: '/api/v1/profile',
    UPDATE_USERNAME: '/api/v1/user/update-username',
    UPDATE_PASSWORD: '/api/v1/user/update-password'
  },
  
  // Recipe endpoints (Recipe Service - 8082)
  RECIPE: {
    GENERATE: '/api/v1/recipes/generate',
    CREATE: '/api/v1/recipes/create-meal',
    GET_ALL: '/api/v1/recipes',
    GET_ONE: '/api/v1/recipes/',
    UPDATE: '/api/v1/recipes/',
    DELETE: '/api/v1/recipes/',
    FAVORITE: '/api/v1/recipes/favorite'
  }
}; 