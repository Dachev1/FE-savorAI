import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

/** ------------------------------------------------------------------
 *  Types & Interfaces
 * ----------------------------------------------------------------- */
interface IFormErrors {
  [key: string]: string;
}

/** ------------------------------------------------------------------
 *  Helper: validateForm
 * ----------------------------------------------------------------- */
function validateForm(
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): IFormErrors {
  const newErrors: IFormErrors = {};

  if (!username.trim()) {
    newErrors.username = 'Username is required.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = 'Please enter a valid email address.';
  }

  if (!/^(?=.*[A-Za-z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) {
    newErrors.password =
      'Password must be at least 8 characters, include a letter, and a special character.';
  }

  if (password !== confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match.';
  }

  return newErrors;
}

/** ------------------------------------------------------------------
 *  Main Component: SignUp
 * ----------------------------------------------------------------- */
const SignUp: React.FC = () => {
  // Form States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<IFormErrors>({});

  // AOS Initialization
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  /**
   *  Handle Sign Up
   */
  const handleSignUp = () => {
    const formErrors = validateForm(username, email, password, confirmPassword);
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      console.log('Sign Up Successful');
      // Add sign-up logic here (e.g., API request)
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light p-4">
      <SignUpContainer>
        <SignUpHeader />
        <SignUpForm
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          errors={errors}
          onSignUp={handleSignUp}
        />
        <SignInRedirect />
      </SignUpContainer>
    </div>
  );
};

export default SignUp;

/** ------------------------------------------------------------------
 *  Subcomponent: SignUpContainer
 *  Simple wrapper with styling for the main sign-up box.
 * ----------------------------------------------------------------- */
interface SignUpContainerProps {
  children: React.ReactNode;
}

const SignUpContainer: React.FC<SignUpContainerProps> = ({ children }) => (
  <div
    className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md hover:shadow-xl transition-all"
    data-aos="fade-up"
  >
    {children}
  </div>
);

/** ------------------------------------------------------------------
 *  Subcomponent: SignUpHeader
 *  Displays a title and subtitle.
 * ----------------------------------------------------------------- */
const SignUpHeader: React.FC = () => (
  <div className="text-center mb-6">
    <h2 className="text-3xl font-bold text-dark">Join Us</h2>
    <p className="text-secondary">Sign up to get started</p>
  </div>
);

/** ------------------------------------------------------------------
 *  Subcomponent: SignUpForm
 *  Handles input fields and sign-up submission.
 * ----------------------------------------------------------------- */
interface SignUpFormProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  errors: IFormErrors;
  onSignUp: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  onSignUp,
}) => (
  <form
    className="space-y-6"
    // Prevent default form submission to allow custom handling
    onSubmit={(e) => e.preventDefault()}
  >
    {/* Username Field */}
    <div>
      <label
        htmlFor="username"
        className={`block text-sm font-medium ${username ? 'text-accent' : 'text-secondary'}`}
      >
        Username
      </label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={`mt-1 w-full px-4 py-3 rounded-lg border ${
          errors.username ? 'border-red-500' : 'border-gray-300'
        } shadow-sm`}
        placeholder="Choose a username"
      />
      {errors.username && (
        <p className="mt-2 text-sm text-red-500">{errors.username}</p>
      )}
    </div>

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
          errors.email ? 'border-red-500' : 'border-gray-300'
        } shadow-sm`}
        placeholder="Enter your email"
      />
      {errors.email && (
        <p className="mt-2 text-sm text-red-500">{errors.email}</p>
      )}
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
        className={`mt-1 w-full px-4 py-3 rounded-lg border ${
          errors.password ? 'border-red-500' : 'border-gray-300'
        } shadow-sm`}
        placeholder="Create a password"
      />
      {errors.password && (
        <p className="mt-2 text-sm text-red-500">{errors.password}</p>
      )}
    </div>

    {/* Confirm Password Field */}
    <div>
      <label
        htmlFor="confirmPassword"
        className={`block text-sm font-medium ${
          confirmPassword ? 'text-accent' : 'text-secondary'
        }`}
      >
        Confirm Password
      </label>
      <input
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className={`mt-1 w-full px-4 py-3 rounded-lg border ${
          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
        } shadow-sm`}
        placeholder="Confirm your password"
      />
      {errors.confirmPassword && (
        <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
      )}
    </div>

    {/* Sign Up Button */}
    <button
      type="submit"
      onClick={onSignUp}
      className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform"
    >
      Sign Up
    </button>
  </form>
);

/** ------------------------------------------------------------------
 *  Subcomponent: SignInRedirect
 *  Displays link to sign in page for existing users.
 * ----------------------------------------------------------------- */
const SignInRedirect: React.FC = () => (
  <p className="text-sm text-secondary text-center mt-6">
    Already have an account?{' '}
    <a href="/signin" className="text-accent font-bold hover:underline">
      Sign in here
    </a>
  </p>
);
