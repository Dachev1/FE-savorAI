import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home: React.FC = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
        });
    }, []);

    return (
        <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-light via-softGray to-accent overflow-hidden">
            <section className="flex-grow flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-16 gap-12">
                <div
                    className="relative md:w-1/2 flex justify-center items-center"
                    data-aos="fade-up"
                >
                    <img
                        src="/assets/hero-image.png"
                        alt="Hero"
                        className="rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 w-full md:w-4/5"
                    />

                </div>

                <div
                    className="md:w-1/2 flex flex-col items-start space-y-8"
                    data-aos="fade-right"
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark leading-tight">
                        Your <span className="text-accent">Perfect</span> Recipe Partner
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-dark/80 leading-relaxed">
                        Revolutionize your cooking experience with SavorAI's intelligent recipe recommendations and
                        planning tools. The future of effortless cooking starts here!
                    </p>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <Link
                            to="/signup"
                            className="px-8 py-3 bg-accent text-white font-semibold rounded-full shadow-lg hover:bg-dark hover:scale-105 transition-transform duration-300">
                            Get Started
                        </Link>
                        <Link
                            to="/learn-more"
                            className="px-8 py-3 border border-accent text-accent font-bold rounded-full shadow-md hover:bg-accent hover:text-white hover:scale-110 transition-transform duration-300"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute top-12 left-10 w-72 h-72 bg-accent opacity-20 rounded-full blur-3xl animate-pulse"
                    data-aos="zoom-in"
                ></div>
                <div
                    className="absolute bottom-12 right-16 w-96 h-96 bg-dark opacity-10 rounded-full blur-3xl animate-pulse"
                    data-aos="zoom-in"
                    data-aos-delay="300"
                ></div>
            </div>
        </div>
    );
};

export default Home;
