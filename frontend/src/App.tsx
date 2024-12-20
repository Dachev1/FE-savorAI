import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SignIn from './pages/SignInSignUp/SignIn';
import SignUp from './pages/SignInSignUp/SignUp';
import LearnMore from './pages/LearnMore';
import { Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/learn-more" element={<LearnMore />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

export default App;
