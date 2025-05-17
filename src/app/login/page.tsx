'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DiaryLogo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await login(data.token);
      router.push('/login-verify', { scroll: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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

      {/* Logo positioned absolutely */}
      <div className="absolute top-8 left-8 z-10">
        <DiaryLogo
          className=""
          logoClassName="text-3xl font-serif italic text-white hover:text-white transition-colors"
        />
        <p className="text-white text-sm mt-1">Your personal stories & reflections</p>
      </div>

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left empty space - can be used for other content if needed */}
        <div className="w-1/2"></div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="w-full max-w-md p-8 border border-pink-100 rounded-xl shadow-xl bg-white bg-opacity-90 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-pink-900 mb-2">Welcome Back</h2>
              <p className="text-pink-600">Sign in to your Diary account</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-pink-900 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition text-black"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-pink-900 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition text-black"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-pink-400 hover:text-pink-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-pink-600 focus:ring-pink-300 border-pink-200 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-pink-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="/forgot-password"
                    className="font-medium text-pink-600 hover:text-pink-500"
                  >
                    Forgot password?
                  </a>
                </div>
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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-pink-700">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-pink-600 hover:text-pink-500">
                Create one
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
