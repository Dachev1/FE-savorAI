import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="relative flex flex-col min-h-screen bg-light overflow-hidden">
            {/* Hero Section */}
            <section className="flex-grow flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Text Content */}
                <div className="md:w-1/2" data-aos="fade-right" data-aos-duration="1000">
                    <h1 className="text-6xl font-extrabold text-dark leading-tight mb-6">
                        Seamless <span className="text-accent">Cooking</span>, Effortless{' '}
                        <span className="text-accent">Recipes</span>
                    </h1>
                    <p className="text-xl text-secondary mb-8">
                        Discover a smarter way to cook with AI-powered personalized recipes and planning.
                    </p>
                    <div className="flex space-x-4">
                        <button className="px-6 py-3 bg-accent text-white font-bold rounded-full shadow-lg hover:bg-dark hover:scale-105 transition-transform duration-200">
                            Get Started
                        </button>
                        <Link
                            to="/learn-more"
                            className="px-6 py-3 border border-accent text-accent font-bold rounded-full shadow-lg hover:bg-accent hover:text-white hover:scale-105 transition-transform duration-200"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Illustration */}
                <div className="md:w-1/2" data-aos="fade-left" data-aos-duration="1000">
                    <img
                        src="/assets/hero-image.png"
                        alt="Hero"
                        className="rounded-3xl shadow-soft animate-fade-in"
                    />
                </div>
            </section>
        </div>
    );
};

export default Home;
