import React from 'react';
import { Link } from 'react-router-dom';

const Error: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <BackgroundEffects />
      <BreadIllustration />
      <TitleSection />
      <FunButtons />
      <CheerUpBread />
    </div>
  );
};

export default Error;

/** ------------------------------------------------------------------
 *  Subcomponent: BackgroundEffects
 *  Handles the decorative animated circles in the background.
 * ----------------------------------------------------------------- */
const BackgroundEffects: React.FC = () => (
  <div className="absolute inset-0 -z-10">
    <div
      className="absolute top-16 left-10 w-72 h-72 bg-accent opacity-20 rounded-full blur-3xl animate-pulse"
    />
    <div
      className="absolute bottom-12 right-16 w-96 h-96 bg-dark opacity-10 rounded-full blur-3xl animate-pulse"
    />
  </div>
);

/** ------------------------------------------------------------------
 *  Subcomponent: BreadIllustration
 *  Renders the 404 bread image & small overlay text.
 * ----------------------------------------------------------------- */
const BreadIllustration: React.FC = () => (
  <div className="relative mb-10">
    <img
      src="/assets/burned-bread.png"
      alt="Burned Bread"
      className="rounded-full shadow-lg w-64 md:w-80 transform rotate-12 hover:rotate-0 hover:scale-110 transition-transform duration-700"
    />
    <div
      className="absolute top-0 -right-6 bg-accent text-white rounded-full p-3 shadow-lg transform scale-105"
    >
      <span className="text-4xl">404🔥</span>
    </div>
  </div>
);

/** ------------------------------------------------------------------
 *  Subcomponent: TitleSection
 *  Renders the main title text and subtitle.
 * ----------------------------------------------------------------- */
const TitleSection: React.FC = () => (
  <>
    <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 text-center">
      Oops! <span className="text-accent">We're Toasted!</span>
    </h1>
    <p className="text-lg sm:text-xl text-dark/80 mb-8 text-center max-w-2xl leading-relaxed">
      It seems like we left this page in the oven for too long... Don&apos;t worry, 
      we&apos;ll scrape off the edges and get it back soon! 🍞
    </p>
  </>
);

/** ------------------------------------------------------------------
 *  Subcomponent: FunButtons
 *  Renders the "Back to Home" button (and could hold more buttons).
 * ----------------------------------------------------------------- */
const FunButtons: React.FC = () => (
  <div className="flex flex-wrap gap-4 justify-center">
    <Link
      to="/"
      className="px-8 py-3 bg-accent text-white font-bold rounded-full shadow-xl hover:bg-dark hover:scale-110 focus:ring-4 focus:ring-accent focus:ring-opacity-50 transition-transform duration-300"
    >
      Back to Home
    </Link>
  </div>
);

/** ------------------------------------------------------------------
 *  Subcomponent: CheerUpBread
 *  Renders a button that triggers a playful alert.
 * ----------------------------------------------------------------- */
const CheerUpBread: React.FC = () => (
  <div className="mt-10 text-center">
    <p className="text-sm text-dark/60 mb-4">Or, press the bread to cheer it up!</p>
    <button
      onClick={() => alert("Don't worry! We'll fix this bread! 🍞")}
      className="px-6 py-2 bg-dark text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 hover:scale-105 transition-transform duration-300"
    >
      Cheer Up the Bread
    </button>
  </div>
);
