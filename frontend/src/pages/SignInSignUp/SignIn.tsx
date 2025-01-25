import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

/**
 * Reusable helper function: validateEmail
 * This can be placed in a separate utils file if you like.
 */
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const SignIn: React.FC = () => {
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  /**
   * Handle sign-in submission
   */
  const handleSignIn = () => {
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    // Replace with real sign-in logic (API calls, etc.)
    console.log('Sign In Successful');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light p-4">
      <SignInContainer>
        <SignInHeader />
        <SignInForm
          email={email}
          setEmail={setEmail}
          emailError={emailError}
          password={password}
          setPassword={setPassword}
          onSignIn={handleSignIn}
        />
        <SignUpRedirect />
      </SignInContainer>
    </div>
  );
};

export default SignIn;

/** ------------------------------------------------------------------
 *  Subcomponent: SignInContainer
 *  A simple wrapper for the main sign-in box.
 * ----------------------------------------------------------------- */
interface SignInContainerProps {
  children: React.ReactNode;
}

const SignInContainer: React.FC<SignInContainerProps> = ({ children }) => (
  <div
    className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md hover:shadow-xl transition-all"
    data-aos="fade-up"
  >
    {children}
  </div>
);

/** ------------------------------------------------------------------
 *  Subcomponent: SignInHeader
 *  Displays a title and a subtitle for the page.
 * ----------------------------------------------------------------- */
const SignInHeader: React.FC = () => (
  <div className="text-center mb-6">
    <h2 className="text-3xl font-bold text-dark">Welcome Back</h2>
    <p className="text-secondary">Sign in to continue</p>
  </div>
);

/** ------------------------------------------------------------------
 *  Subcomponent: SignInForm
 *  Handles input fields (email & password) and sign-in button.
 * ----------------------------------------------------------------- */
interface SignInFormProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  emailError: string;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  onSignIn: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  setEmail,
  emailError,
  password,
  setPassword,
  onSignIn,
}) => {
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className={`block text-sm font-medium ${email ? 'text-accent' : 'text-secondary'}`}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 w-full px-4 py-3 rounded-lg border ${
            emailError ? 'border-red-500' : 'border-gray-300'
          } shadow-sm`}
          placeholder="Enter your email"
        />
        {emailError && <p className="mt-2 text-sm text-red-500">{emailError}</p>}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className={`block text-sm font-medium ${password ? 'text-accent' : 'text-secondary'}`}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm"
          placeholder="Enter your password"
        />
      </div>

      {/* Sign In Button */}
      <button
        type="button"
        onClick={onSignIn}
        className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform"
      >
        Sign In
      </button>
    </form>
  );
};

/** ------------------------------------------------------------------
 *  Subcomponent: SignUpRedirect
 *  Link to sign up page if user doesn't have an account.
 * ----------------------------------------------------------------- */
const SignUpRedirect: React.FC = () => (
  <p className="text-sm text-secondary text-center mt-6">
    Don&apos;t have an account?{' '}
    <a href="/signup" className="text-accent font-bold hover:underline">
      Sign up here
    </a>
  </p>
);
