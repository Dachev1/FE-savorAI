# SavorAI Frontend

<p align="center">
  <img src="public/logo.png" alt="SavorAI Logo" width="200" />
</p>

<p align="center">
  A modern React application for AI-powered recipe generation and culinary management
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#available-scripts">Available Scripts</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## ✨ Features

- AI-powered recipe generation based on ingredients, cuisine, or dietary preferences
- User authentication and profile management
- Recipe saving, categorization, and sharing
- Ingredient tracking and shopping list generation
- Interactive cooking mode with step-by-step instructions
- Responsive design for mobile, tablet, and desktop

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/savorAI.git
cd savorAI/frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=http://localhost:8081
VITE_AUTH_REDIRECT_URL=http://localhost:5173/signin?verified=true
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🔧 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for lightning-fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: Material UI for enhanced UI elements
- **State Management**: React Context API for global state
- **Routing**: React Router v7 for navigation
- **Form Handling**: Formik with Yup validation
- **HTTP Client**: Axios for API requests
- **Animations**: Framer Motion and AOS for scroll animations
- **Icons**: React Icons and Material UI Icons
- **Date Management**: date-fns for date manipulations
- **Notifications**: React Toastify for user notifications

## 📁 Project Structure

```
frontend/
├── public/           # Static assets and favicon
├── src/
│   ├── api/          # API configuration and service functions
│   ├── components/   # Reusable UI components
│   ├── constants/    # Application constants and configuration
│   ├── context/      # React context providers for state management
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Application pages/views
│   ├── routes/       # Route definitions and navigation config
│   ├── services/     # Business logic and data services
│   ├── styles/       # Global styles and Tailwind configuration
│   ├── types/        # TypeScript type definitions and interfaces
│   ├── utils/        # Utility and helper functions
│   ├── App.tsx       # Main application component
│   ├── main.tsx      # Application entry point
│   └── index.css     # Global CSS styles
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8081 |
| VITE_AUTH_REDIRECT_URL | Authentication redirect URL | http://localhost:5173/signin?verified=true |

### Proxy Configuration

API requests are proxied to the backend server defined in `package.json`:

```json
{
  "proxy": "http://localhost:8081"
}
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run serve` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run clean` | Clean build artifacts and cache |

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This generates optimized static files in the `dist` directory.

### Deployment Options

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Connect to GitHub or upload the `dist` folder
- **Docker**: Use the provided Dockerfile for containerized deployment
- **Static Hosting**: Upload the `dist` directory to any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
