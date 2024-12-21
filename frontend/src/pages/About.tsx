import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const About: React.FC = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
        });
    }, []);

    return (
        <div className="bg-gradient-to-br from-light via-softGray to-accent min-h-screen overflow-hidden">
            {/* Hero Section */}
            <section
                className="flex flex-col items-center text-center py-20 px-6"
                data-aos="fade-up"
            >
                <h1 className="text-5xl sm:text-6xl font-extrabold text-dark mb-6">
                    Meet the Creator
                </h1>
                <p className="text-lg sm:text-xl max-w-3xl text-dark/80 leading-relaxed">
                    From humble beginnings to revolutionizing kitchens, here's the story behind SavorAI.
                </p>
            </section>

            {/* About Section */}
            <section className="max-w-7xl mx-auto py-16 px-6 sm:px-12 flex flex-col md:flex-row items-center gap-16">
                {/* Image */}
                <div
                    className="md:w-1/2 flex justify-center"
                    data-aos="fade-right"
                >
                    <div className="relative">
                        <img
                            src="/public/assets/me-photo.jpg" // Replace with your actual image path
                            alt="Ivan Dachev"
                            className="rounded-3xl shadow-2xl w-full md:w-3/4 transform hover:scale-105 transition-transform duration-500"
                        />
                        <div
                            className="absolute -top-6 -left-6 w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center shadow-lg"
                            data-aos="zoom-in"
                            data-aos-delay="300"
                        >
                            ✨
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div
                    className="md:w-1/2 space-y-6"
                    data-aos="fade-left"
                >
                    <h2 className="text-4xl font-bold text-dark">
                        A Passion for Culinary Innovation
                    </h2>
                    <p className="text-base sm:text-lg text-dark/80 leading-relaxed">
                        Hi! I'm Ivan Dachev, the creator of SavorAI. My passion for cooking, paired with
                        my love for technology, led me to create this tool to empower everyone in the kitchen.
                    </p>
                    <p className="text-base sm:text-lg text-dark/80 leading-relaxed">
                        Whether you're an experienced chef or just starting out, SavorAI simplifies your
                        journey while bringing creativity and joy into every meal.
                    </p>
                    <p className="text-base sm:text-lg text-dark/80 leading-relaxed">
                        Together, we can transform the way we cook and connect through food. Welcome to a smarter,
                        more delicious future!
                    </p>
                </div>
            </section>

            {/* Call-to-Action Section */}
            <section
                className="py-16 bg-gray-900 text-white text-center"
                data-aos="fade-up"
            >
                <h2 className="text-4xl font-bold mb-6">
                    Let's Cook Smarter Together
                </h2>
                <p className="text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
                    Ready to elevate your cooking experience? Join the SavorAI community today and unlock the future of smart cooking.
                </p>
                <a
                    href="/signup"
                    className="inline-block px-10 py-4 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 transition-transform duration-300 transform hover:scale-105"
                >
                    Get Started
                </a>
            </section>

            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                <div
                    className="absolute top-10 left-16 w-72 h-72 bg-accent opacity-20 rounded-full blur-3xl animate-pulse"
                    data-aos="zoom-in"
                ></div>
                <div
                    className="absolute bottom-20 right-16 w-96 h-96 bg-dark opacity-10 rounded-full blur-3xl animate-pulse"
                    data-aos="zoom-in"
                    data-aos-delay="200"
                ></div>
            </div>
        </div>
    );
};

export default About;
