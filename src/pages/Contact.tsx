import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Contact: React.FC = () => {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800, // Animation duration
      easing: 'ease-in-out', // Smooth easing
      once: true,    // Trigger animations only once
    });
  }, []);

  return (
    <div className="bg-gradient-to-br from-light via-softGray to-accent min-h-screen py-20 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
      <BackgroundEffects />
      <ContactSection />
    </div>
  );
};

export default Contact;

/** ------------------------------------------------------------------
 *  Subcomponent: BackgroundEffects
 *  Handles the decorative animated circles in the background.
 * ----------------------------------------------------------------- */
const BackgroundEffects: React.FC = () => (
  <div className="absolute inset-0 -z-10">
    <div
      className="absolute top-10 left-16 w-72 h-72 bg-accent opacity-25 rounded-full blur-3xl animate-pulse"
      data-aos="zoom-in"
    />
    <div
      className="absolute bottom-16 right-12 w-80 h-80 bg-dark opacity-10 rounded-full blur-3xl animate-pulse"
      data-aos="zoom-in"
      data-aos-delay="200"
    />
  </div>
);

/** ------------------------------------------------------------------
 *  Subcomponent: ContactSection
 *  Renders the main contact form and heading.
 * ----------------------------------------------------------------- */
const ContactSection: React.FC = () => (
  <section
    className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 sm:p-12"
    data-aos="fade-up"
  >
    <ContactHeader />
    <ContactForm />
  </section>
);

/** ------------------------------------------------------------------
 *  Subcomponent: ContactHeader
 *  Displays the heading and subtitle text.
 * ----------------------------------------------------------------- */
const ContactHeader: React.FC = () => (
  <>
    <h2
      className="text-4xl sm:text-5xl font-extrabold text-dark text-center mb-6"
      data-aos="fade-down"
    >
      We&apos;d Love to Hear From You
    </h2>
    <p
      className="text-lg text-dark/70 text-center mb-10"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      Have questions, suggestions, or just want to say hello?
      Send us a message. Let&apos;s make cooking smarter together!
    </p>
  </>
);

/** ------------------------------------------------------------------
 *  Subcomponent: ContactForm
 *  Handles form fields and submission button.
 * ----------------------------------------------------------------- */
const ContactForm: React.FC = () => (
  <form className="space-y-8" data-aos="zoom-in" data-aos-delay="400">
    {/* Name Field */}
    <div>
      <label
        htmlFor="name"
        className="block text-dark font-semibold mb-2"
      >
        Your Name
      </label>
      <input
        type="text"
        id="name"
        name="name"
        placeholder="John Doe"
        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-accent focus:border-accent transition duration-300"
        required
      />
    </div>

    {/* Email Field */}
    <div>
      <label
        htmlFor="email"
        className="block text-dark font-semibold mb-2"
      >
        Email Address
      </label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="example@email.com"
        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-accent focus:border-accent transition duration-300"
        required
      />
    </div>

    {/* Message Field */}
    <div>
      <label
        htmlFor="message"
        className="block text-dark font-semibold mb-2"
      >
        Your Message
      </label>
      <textarea
        id="message"
        name="message"
        rows={5}
        placeholder="Write your message here..."
        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-accent focus:border-accent transition duration-300"
        required
      />
    </div>

    {/* Submit Button */}
    <div className="text-center">
      <button
        type="submit"
        className="px-8 py-3 bg-accent text-white font-bold rounded-full shadow-lg hover:bg-dark hover:scale-105 focus:ring-4 focus:ring-accent transition-transform duration-300"
      >
        Send Message
      </button>
    </div>
  </form>
);
