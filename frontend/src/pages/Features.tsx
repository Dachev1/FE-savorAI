const Features: React.FC = () => {
    return (
        <section className="py-16 bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-extrabold text-dark mb-12">
                    Why Choose SavorAI?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-white rounded-3xl shadow-soft hover:shadow-lg transition-shadow">
                        <h3 className="text-2xl font-bold text-accent mb-4">
                            AI-Powered Recipes
                        </h3>
                        <p className="text-secondary">
                            Generate recipes tailored to your available ingredients.
                        </p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl shadow-soft hover:shadow-lg transition-shadow">
                        <h3 className="text-2xl font-bold text-accent mb-4">
                            Custom Diet Plans
                        </h3>
                        <p className="text-secondary">
                            Personalize meal plans to suit your lifestyle and health goals.
                        </p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl shadow-soft hover:shadow-lg transition-shadow">
                        <h3 className="text-2xl font-bold text-accent mb-4">Save & Share</h3>
                        <p className="text-secondary">
                            Save your favorite recipes and share them with friends.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
