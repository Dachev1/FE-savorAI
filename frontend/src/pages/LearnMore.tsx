import React from 'react';

const LearnMore: React.FC = () => {
    const steps = [
        {
            id: 1,
            title: "Inventory Insights",
            description: "Enter the ingredients in your kitchen, and SavorAI will generate creative recipes tailored just for you.",
        },
        {
            id: 2,
            title: "Your Preferences, Your Way",
            description: "Customize recipes based on dietary needs, cuisines, or your unique preferences.",
        },
        {
            id: 3,
            title: "Cook Like a Pro",
            description: "Follow intuitive step-by-step instructions, complete with visuals and nutritional facts.",
        },
    ];

    return (
        <div className="bg-light min-h-screen overflow-hidden">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center text-center py-20 px-6 bg-gradient-to-br from-white via-gray-100 to-gray-200 text-dark">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
                    Redefine Cooking with Ease
                </h1>
                <p className="text-lg md:text-xl max-w-4xl leading-relaxed animate-fade-in-up text-dark/70">
                    Experience a seamless, personalized approach to cooking with SavorAI. Your kitchen, your rules, powered by AI.
                </p>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 lg:px-12 bg-gray-100">
                <h2 className="text-4xl font-bold text-center text-dark mb-12 animate-slide-in">
                    How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center text-center animate-zoom-in delay-100">
                            <div className="bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                                {step.id}
                            </div>
                            <h3 className="text-xl font-bold text-dark mb-2">{step.title}</h3>
                            <p className="text-dark/80">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call-to-Action Section */}
            <section className="py-16 bg-gray-900 text-white text-center">
                <h2 className="text-4xl font-bold mb-6 animate-slide-in">
                    Ready to Elevate Your Cooking?
                </h2>
                <p className="text-lg max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-up">
                    SavorAI transforms your everyday meals into extraordinary experiences. Start your journey now.
                </p>
                <a
                    href="/signup"
                    className="inline-block px-10 py-4 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 transition-transform duration-300"
                >
                    Get Started
                </a>
            </section>
        </div>
    );
};

export default LearnMore;
