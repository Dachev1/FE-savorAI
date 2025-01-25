import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { LEARN_MORE_STEPS, Step } from '../constants/steps';

const LearnMore: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  return (
    <div className="bg-light min-h-screen overflow-hidden">
      <HeroSection />
      <FeaturesSection steps={LEARN_MORE_STEPS} />
      <CTASection />
    </div>
  );
};

export default LearnMore;

/** ------------------------------------------------------------------
 *  Subcomponent: HeroSection
 *  Renders the top hero area with heading and subtitle.
 * ----------------------------------------------------------------- */
const HeroSection: React.FC = () => (
  <section
    className="flex flex-col items-center text-center py-20 px-6 bg-gradient-to-br from-white via-gray-100 to-gray-200 text-dark"
    data-aos="fade-up"
  >
    <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
      Redefine Cooking with Ease
    </h1>
    <p className="text-lg md:text-xl max-w-4xl leading-relaxed text-dark/70">
      Experience a seamless, personalized approach to cooking with SavorAI. 
      Your kitchen, your rules, powered by AI.
    </p>
  </section>
);

/** ------------------------------------------------------------------
 *  Subcomponent: FeaturesSection
 *  Displays a list of steps describing how the product works.
 * ----------------------------------------------------------------- */
interface FeaturesSectionProps {
  steps: Step[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ steps }) => (
  <section className="py-20 px-6 lg:px-12 bg-gray-100">
    <h2 className="text-4xl font-bold text-center text-dark mb-12" data-aos="fade-down">
      How It Works
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
      {steps.map((step) => (
        <StepCard key={step.id} step={step} />
      ))}
    </div>
  </section>
);

/** ------------------------------------------------------------------
 *  Subcomponent: StepCard
 *  Renders an individual step in the features section.
 * ----------------------------------------------------------------- */
interface StepCardProps {
  step: Step;
}

const StepCard: React.FC<StepCardProps> = ({ step }) => (
  <div
    className="flex flex-col items-center text-center"
    data-aos="zoom-in"
    data-aos-delay={`${step.id * 200}`}
  >
    <div className="bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
      {step.id}
    </div>
    <h3 className="text-xl font-bold text-dark mb-2">{step.title}</h3>
    <p className="text-dark/80">{step.description}</p>
  </div>
);

/** ------------------------------------------------------------------
 *  Subcomponent: CTASection
 *  Renders the call-to-action at the bottom.
 * ----------------------------------------------------------------- */
const CTASection: React.FC = () => (
  <section className="py-16 bg-gray-900 text-white text-center" data-aos="fade-up">
    <h2 className="text-4xl font-bold mb-6">Ready to Elevate Your Cooking?</h2>
    <p className="text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
      SavorAI transforms your everyday meals into extraordinary experiences. 
      Start your journey now.
    </p>
    <a
      href="/signup"
      className="inline-block px-10 py-4 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 transition-transform duration-300 transform hover:scale-105"
    >
      Get Started
    </a>
  </section>
);
