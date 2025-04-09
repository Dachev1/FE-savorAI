import APIService, { parseJwt } from './APIService';
import favoriteService from './favoriteService';
import CommentService from './CommentService';

export {
  APIService,
  favoriteService,
  CommentService,
  parseJwt
};

// Default export for backward compatibility
export default {
  APIService,
  favoriteService,
  CommentService,
  parseJwt
}; 