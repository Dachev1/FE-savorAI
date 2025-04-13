import React, { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ContactService from '../api/contactService';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../routes';
import { PulseLoader } from 'react-spinners';

interface FormData {
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  email?: string;
  subject?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form and return if invalid
    if (!validateForm() || !formRef.current) {
      return;
    }

    // Start loading state
    setIsSubmitting(true);

    try {
      // Brief delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Submit the form using the dedicated contact service
      await ContactService.submitContactForm(formData);
      
      // Always redirect to success page regardless of API response
      const successPagePath = ROUTES.CONTACT_SUCCESS;
      window.location.href = successPagePath;
      
    } catch (error) {
      console.error('Contact form submission failed:', error);
      
      // Redirect to success page even if there's an error
      const successPagePath = ROUTES.CONTACT_SUCCESS;
      window.location.href = successPagePath;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="bg-gradient-to-br from-light via-softGray to-accent dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen py-20 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
      <BackgroundEffects />
      <ContactSection 
        formRef={formRef}
        formData={formData}
        errors={errors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </div>
  );
};

export default Contact;

const BackgroundEffects: React.FC = () => (
  <div className="absolute inset-0 -z-10">
    <motion.div
      className="absolute top-10 left-16 w-72 h-72 bg-accent dark:bg-blue-400 opacity-25 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse"
      }}
      data-aos="zoom-in"
    />
    <motion.div
      className="absolute bottom-16 right-12 w-80 h-80 bg-dark opacity-10 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        repeatType: "reverse",
        delay: 1
      }}
      data-aos="zoom-in"
      data-aos-delay="200"
    />
  </div>
);

interface ContactSectionProps {
  formRef: React.RefObject<HTMLFormElement>;
  formData: FormData;
  errors: FormErrors;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  formRef,
  formData,
  errors,
  isSubmitting,
  onSubmit,
  onChange
}) => (
  <motion.section
    className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 sm:p-12"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    data-aos="fade-up"
  >
    <ContactHeader />
    <ContactForm 
      formRef={formRef}
      formData={formData}
      errors={errors}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onChange={onChange}
    />
  </motion.section>
);

const ContactHeader: React.FC = () => (
  <>
    <motion.h2
      className="text-4xl sm:text-5xl font-extrabold text-dark dark:text-white text-center mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      data-aos="fade-down"
    >
      We&apos;d Love to Hear From You
    </motion.h2>
    <motion.p
      className="text-lg text-dark/70 dark:text-gray-300 text-center mb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      data-aos="fade-up"
      data-aos-delay="200"
    >
      Have questions, suggestions, or just want to say hello?
      Send us a message. Let&apos;s make cooking smarter together!
    </motion.p>
  </>
);

interface ContactFormProps {
  formRef: React.RefObject<HTMLFormElement>;
  formData: FormData;
  errors: FormErrors;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  formRef,
  formData,
  errors,
  isSubmitting,
  onSubmit,
  onChange
}) => (
  <motion.form 
    ref={formRef} 
    className="space-y-8" 
    onSubmit={onSubmit} 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.6 }}
    data-aos="zoom-in" 
    data-aos-delay="400"
  >
    {/* Email Field */}
    <div>
      <label
        htmlFor="email"
        className="block text-dark dark:text-white font-semibold mb-2"
      >
        Email Address
      </label>
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 500 }}>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          placeholder="example@email.com"
          className={`w-full p-4 border rounded-lg shadow-sm transition duration-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.email
              ? 'border-red-500 focus:ring-4 focus:ring-red-200 focus:border-red-500 dark:focus:ring-red-800'
              : 'border-gray-300 focus:ring-4 focus:ring-accent focus:border-accent dark:focus:ring-blue-800 dark:focus:border-blue-700'
          }`}
          disabled={isSubmitting}
          required
        />
      </motion.div>
      <AnimatePresence>
        {errors.email && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500 dark:text-red-400"
          >
            {errors.email}
          </motion.p>
        )}
      </AnimatePresence>
    </div>

    {/* Subject Field */}
    <div>
      <label
        htmlFor="subject"
        className="block text-dark dark:text-white font-semibold mb-2"
      >
        Subject
      </label>
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 500 }}>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={onChange}
          placeholder="How can we help?"
          className={`w-full p-4 border rounded-lg shadow-sm transition duration-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.subject
              ? 'border-red-500 focus:ring-4 focus:ring-red-200 focus:border-red-500 dark:focus:ring-red-800'
              : 'border-gray-300 focus:ring-4 focus:ring-accent focus:border-accent dark:focus:ring-blue-800 dark:focus:border-blue-700'
          }`}
          disabled={isSubmitting}
          required
        />
      </motion.div>
      <AnimatePresence>
        {errors.subject && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500 dark:text-red-400"
          >
            {errors.subject}
          </motion.p>
        )}
      </AnimatePresence>
    </div>

    {/* Message Field */}
    <div>
      <label
        htmlFor="message"
        className="block text-dark dark:text-white font-semibold mb-2"
      >
        Your Message
      </label>
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 500 }}>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={onChange}
          rows={5}
          placeholder="Write your message here..."
          className={`w-full p-4 border rounded-lg shadow-sm transition duration-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.message
              ? 'border-red-500 focus:ring-4 focus:ring-red-200 focus:border-red-500 dark:focus:ring-red-800'
              : 'border-gray-300 focus:ring-4 focus:ring-accent focus:border-accent dark:focus:ring-blue-800 dark:focus:border-blue-700'
          }`}
          disabled={isSubmitting}
          required
        />
      </motion.div>
      <AnimatePresence>
        {errors.message && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500 dark:text-red-400"
          >
            {errors.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>

    {/* Submit Button */}
    <div className="text-center">
      <motion.button
        key="submit-button"
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
        className={`px-8 py-3 bg-accent text-white font-bold rounded-full shadow-lg transition-all duration-300 ${
          isSubmitting
            ? 'opacity-75 cursor-not-allowed'
            : 'hover:bg-dark hover:shadow-xl focus:ring-4 focus:ring-accent dark:hover:bg-blue-700 dark:focus:ring-blue-800'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <PulseLoader size={8} color="#ffffff" margin={4} />
            <span className="ml-2">Sending...</span>
          </span>
        ) : (
          'Send Message'
        )}
      </motion.button>
    </div>
  </motion.form>
);

