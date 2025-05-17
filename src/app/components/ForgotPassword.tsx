'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DiaryLogo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { login, token } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3000/user/forget-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }
      await login(data.token);
      router.push(`/password-reset-verify`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Full-screen background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage:
            "url('https://d4804za1f1gw.cloudfront.net/wp-content/uploads/sites/50/2018/11/hero.jpg')",
          backgroundAttachment: 'fixed',
          opacity: 0.85,
        }}
      />

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/10 z-1"></div>

      {/* Logo */}
      <div className="absolute top-8 left-8 z-10">
        <DiaryLogo
          className=""
          logoClassName="text-3xl font-serif italic text-white hover:text-white transition-colors"
        />
        <p className="text-white text-sm mt-1">Your personal stories & reflections</p>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left empty space */}
        <div className="w-1/2"></div>

        {/* Right Side - Forgot Password Form */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="w-full max-w-md p-8 border border-pink-100 rounded-xl shadow-xl bg-white/95 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-pink-900 mb-2">Reset Your Password</h2>
              <p className="text-pink-600">Enter your email to receive a reset code</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-pink-900 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition text-black"
                  placeholder="Enter your email address"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 transition ${
                  isLoading ? 'opacity-80' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-pink-700">
              Remember your password?{' '}
              <a href="/login" className="font-medium text-pink-600 hover:text-pink-500">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
