import React, { useState } from 'react';

const SignUp: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!username.trim()) newErrors.username = 'Username is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address.';
        if (!/^(?=.*[A-Za-z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) {
            newErrors.password = 'Password must be at least 8 characters, include a letter, and a special character.';
        }
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = () => {
        if (validateForm()) {
            console.log('Sign Up Successful');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light p-4">
            <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md hover:shadow-xl transition-all">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-dark">Join Us</h2>
                    <p className="text-secondary">Sign up to get started</p>
                </div>
                <form className="space-y-6">
                    <div>
                        <label htmlFor="username" className={`block text-sm font-medium ${username ? 'text-accent' : 'text-secondary'}`}>
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`mt-1 w-full px-4 py-3 rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-300'} shadow-sm`}
                            placeholder="Choose a username"
                        />
                        {errors.username && <p className="mt-2 text-sm text-red-500">{errors.username}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className={`block text-sm font-medium ${email ? 'text-accent' : 'text-secondary'}`}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`mt-1 w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} shadow-sm`}
                            placeholder="Enter your email"
                        />
                        {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
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
                            className={`mt-1 w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} shadow-sm`}
                            placeholder="Create a password"
                        />
                        {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className={`block text-sm font-medium ${confirmPassword ? 'text-accent' : 'text-secondary'}`}>
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`mt-1 w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} shadow-sm`}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={handleSignUp}
                        className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="text-sm text-secondary text-center mt-6">
                    Already have an account?{' '}
                    <a href="/signin" className="text-accent font-bold hover:underline">
                        Sign in here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
