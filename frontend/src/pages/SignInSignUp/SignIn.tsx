import React, { useState } from 'react';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSignIn = () => {
        setEmailError('');

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        console.log('Sign In Successful');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light p-4">
            <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md hover:shadow-xl transition-all">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-dark">Welcome Back</h2>
                    <p className="text-secondary">Sign in to continue</p>
                </div>
                <form className="space-y-6">
                    <div>
                        <label htmlFor="email" className={`block text-sm font-medium ${email ? 'text-accent' : 'text-secondary'}`}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`mt-1 w-full px-4 py-3 rounded-lg border ${emailError ? 'border-red-500' : 'border-gray-300'} shadow-sm`}
                            placeholder="Enter your email"
                        />
                        {emailError && <p className="mt-2 text-sm text-red-500">{emailError}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className={`block text-sm font-medium ${password ? 'text-accent' : 'text-secondary'}`}>
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
                    <button
                        type="button"
                        onClick={handleSignIn}
                        className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform"
                    >
                        Sign In
                    </button>
                </form>
                <p className="text-sm text-secondary text-center mt-6">
                    Don't have an account?{' '}
                    <a href="/signup" className="text-accent font-bold hover:underline">
                        Sign up here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
