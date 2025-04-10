# SavorAI

<p align="center">
  <img src="public/logo.png" alt="SavorAI Logo" width="200">
</p>

<p align="center">
  <a href="https://github.com/yourusername/savorAI/releases">
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  </a>
  <a href="https://github.com/yourusername/savorAI/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  </a>
  <a href="https://github.com/yourusername/savorAI/actions">
    <img src="https://img.shields.io/badge/build-passing-success.svg" alt="Build Status">
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-18-61DAFB.svg" alt="React">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6.svg" alt="TypeScript">
  </a>
</p>

<p align="center">
  AI-powered recipe generator and culinary management platform
</p>

## ✨ Features

- **AI Recipe Generation** - Create custom recipes based on ingredients, dietary restrictions, and cuisine preferences
- **Personal Recipe Collection** - Save, organize, and share your favorite recipes
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices
- **User Authentication** - Secure login and personalized experience
- **Interactive Cooking Mode** - Step-by-step guided cooking instructions

## 📱 Screenshots

<p align="center">
  <img src="public/screenshots/home.png" alt="Home Screen" width="280">
  <img src="public/screenshots/recipe.png" alt="Recipe View" width="280">
  <img src="public/screenshots/generator.png" alt="Recipe Generator" width="280">
</p>

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/savorAI.git
cd savorAI

# Install dependencies
npm install

# Set up environment variables
# Create .env file with required variables (example in .env.example)

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 🔧 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Material UI
- **State Management**: React Context API
- **Routing**: React Router v7
- **Form Handling**: Formik + Yup
- **HTTP Client**: Axios
- **Animation**: Framer Motion + AOS
- **UI Components**: Custom components + Material UI

## 📁 Project Structure

```
src/
├── api/          # API services and configuration
├── components/   # Reusable UI components
├── constants/    # Application constants
├── context/      # React context providers
├── hooks/        # Custom React hooks
├── pages/        # Application views/pages
├── routes/       # Route definitions
├── services/     # Business logic services
├── styles/       # Global styles
├── types/        # TypeScript types and interfaces
├── utils/        # Utility functions
├── App.tsx       # Main application component
└── main.tsx      # Application entry point
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```
# API Configuration
VITE_API_URL=http://localhost:8082
VITE_AUTH_REDIRECT_URL=http://localhost:5173/signin?verified=true
```

### API Configuration

Backend API is proxied through `/api` to avoid CORS issues:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run serve` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview build |
| `npm run clean` | Clean build artifacts |
| `npm run analyze` | Analyze bundle size |
| `npm run typecheck` | Check TypeScript types |

## 🚢 Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run serve
```

### Deployment Options

- **Vercel**: Connect GitHub repository for automatic deployments
- **Netlify**: Connect GitHub or upload `dist` folder
- **Docker**: Use included Dockerfile
- **Static Hosting**: Deploy `dist` directory to any static host

## 🔍 Performance Optimization

- Code splitting via dynamic imports
- Optimized chunk strategy for vendor dependencies
- Image optimization with responsive loading
- Lazy-loaded routes and components

## 🐛 Troubleshooting

### Common Issues

- **API Connection Errors**: Verify backend server is running and `.env` has correct `VITE_API_URL`
- **Build Errors**: Run `npm run clean` and try rebuilding
- **TypeScript Errors**: Run `npm run typecheck` to identify issues

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please follow code style guidelines and include appropriate tests.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 👥 Contributors

- Your Name - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Material UI](https://mui.com/) - React UI components
