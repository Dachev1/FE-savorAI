# SavorAI - Frontend Application

## Overview

SavorAI is a modern web application that combines AI-powered recipe generation with social features, allowing users to create, share, and discover unique recipes. This repository contains the frontend component of SavorAI, built with React, TypeScript, and Tailwind CSS.

## Features

- **AI-Powered Recipe Generation**: Create personalized recipes based on ingredients, dietary preferences, and cuisine types
- **User Authentication**: Secure sign-up, sign-in, and account management
- **Recipe Management**: Create, view, edit, and delete your own recipes
- **Social Interaction**: Discover recipes from other users, add favorites, and leave comments
- **Responsive Design**: Optimized user experience across desktop and mobile devices
- **Admin Dashboard**: Moderation tools for administrators
- **Profile Management**: Update personal information and preferences

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v7
- **State Management**: React Context API and custom hooks
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Material UI (MUI) integration
- **Forms**: Formik for form handling and Yup for validation
- **HTTP Client**: Axios for API communication
- **Animations**: Framer Motion and AOS (Animate On Scroll)
- **Build Tool**: Vite

## Project Structure

```
src/
├── api/          # API service integrations
├── components/   # Reusable UI components
├── constants/    # Application constants
├── context/      # React Context providers
├── hooks/        # Custom React hooks
├── pages/        # Page components
├── routes/       # Route definitions
├── services/     # Business logic services
├── styles/       # Global styles and theme
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
├── App.tsx       # Main application component
└── main.tsx      # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/FE-savorAI.git
   cd FE-savorAI
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   VITE_USER_SERVICE_URL=http://localhost:8081
   VITE_RECIPE_SERVICE_URL=http://localhost:8082
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Access the application at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run serve` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues
- `npm run typecheck` - Run TypeScript type checking
- `npm run clean` - Remove build artifacts and cache
- `npm run analyze` - Analyze bundle size and dependencies

## Deployment

The application is configured for easy deployment on various platforms:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the contents of the `dist` directory** to your preferred hosting service (Netlify, Vercel, AWS S3, etc.)

## Performance Considerations

- The application uses code-splitting via React.lazy for better loading performance
- Connection quality detection to adapt the UI for low-bandwidth scenarios
- Optimized image loading and processing
- Caching of API responses where appropriate
- Minimized bundle size with tree shaking and lazy loading

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Repositories

- [recipe-service-SavorAI](https://github.com/Dachev1/recipe-service-SavorAI) - Recipe management service
- [user-service-SavorAI](https://github.com/Dachev1/user-service-SavorAI) - User authentication and management service 
