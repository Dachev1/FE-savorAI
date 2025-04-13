import axios from 'axios';

/**
 * Contact form data interface
 */
interface ContactFormData {
  email: string;
  subject: string;
  message: string;
}

/**
 * Service for contact-related API calls
 */
const ContactService = {
  /**
   * Submit a contact form to the user service
   * 
   * This explicitly uses the user-service URL regardless of the default API URL
   * configuration to ensure contact form submissions always go to the correct service.
   */
  submitContactForm: async (formData: ContactFormData): Promise<any> => {
    const userServiceUrl = 'http://localhost:8081/api/v1/contact/submit';
    
    try {
      const response = await axios.post(userServiceUrl, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Contact form submission failed:', error);
      throw error;
    }
  }
};

export default ContactService; 