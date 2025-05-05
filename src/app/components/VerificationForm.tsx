"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';
import DiaryLogo from '../components/Logo';

type VerificationType = 'login' | 'register' | 'password-reset';

interface VerificationConfig {
  endpoint: string;
  method: 'PATCH' | 'POST';
  successRedirect: string;
  title: string;
  description: string;
  codeLength: number;
}

const CONFIG: Record<VerificationType, VerificationConfig> = {
  login: {
    endpoint: '/user/login',
    method: 'PATCH',
    successRedirect: '/profile',
    title: 'Secure Login',
    description: 'Enter the verification code sent to your email',
    codeLength: 4
  },
  register: {
    endpoint: '/user/register',
    method: 'PATCH',
    successRedirect: '/login',
    title: 'Verify Your Email',
    description: 'We sent a code to complete your registration',
    codeLength: 4
  },
  'password-reset': {
    endpoint: '/user/login',
    method: 'PATCH',
    successRedirect: '/reset-password',
    title: 'Reset Password',
    description: 'Enter verification code to continue',
    codeLength: 4
  }
};

export default function VerificationForm({ 
  type = 'login',
  email = ''
}: { type?: VerificationType, email?: string }) {
  const { token } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramEmail = searchParams.get('email') || email;
  const inputRef = useRef<HTMLInputElement>(null);

  const currentConfig = CONFIG[type];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== currentConfig.codeLength) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000${currentConfig.endpoint}`, {
        method: currentConfig.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Verification failed');
      }
      
      router.push(currentConfig.successRedirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setCode('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setResendSuccess('');
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/user/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Please wait before requesting a new code');
        }
        throw new Error('Failed to resend code');
      }
      
      setResendSuccess('New code sent successfully!');
      setCode('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend failed');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, currentConfig.codeLength);
    setCode(input);
  };

  const handleInputClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderCodeInputs = () => (
    <div 
      className="flex justify-center gap-4 mb-8 cursor-text"
      onClick={handleInputClick}
    >
      {Array.from({ length: currentConfig.codeLength }).map((_, index) => (
        <div 
          key={index} 
          className={`
            w-16 h-16 flex items-center justify-center text-3xl font-medium rounded-lg border-2 transition-all
            ${code.length > index 
              ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm' 
              : 'border-pink-200 text-gray-400'}
          `}
        >
          {code[index] || '•'}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left image */}
      <div
        className="w-1/2 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1686064196392-fd20325c68c7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDY0fHx8ZW58MHx8fHx8')",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="absolute top-8 left-8 z-10">
          <DiaryLogo className="" logoClassName="text-3xl font-serif italic text-white hover:text-white transition-colors"/>
          <p className="text-white text-sm mt-1">Your personal stories & reflections</p>
        </div>
      </div>

      {/* Right Side - Verification Form */}
      <div className="w-1/2 bg-white flex justify-center items-center">
        <div className="w-full max-w-md p-8 border border-pink-100 rounded-xl shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-pink-900 mb-2">{currentConfig.title}</h2>
            <p className="text-pink-600">{currentConfig.description}</p>
          </div>

          {paramEmail && (
            <div className="mb-6 text-center">
              <p className="text-pink-600 text-sm">Code sent to</p>
              <p className="font-medium text-pink-800 mt-1">{paramEmail}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {resendSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-sm font-medium text-pink-900 mb-3 text-center">
                Verification Code
              </label>
              
              {/* Hidden input for actual code entry */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={currentConfig.codeLength}
                value={code}
                onChange={handleCodeChange}
                className="absolute opacity-0 h-0 w-0"
                autoFocus
                required
              />
              
              {/* Visual code display */}
              {renderCodeInputs()}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== currentConfig.codeLength}
              className={`
                w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 transition
                ${isLoading || code.length !== currentConfig.codeLength
                  ? 'bg-pink-300 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700'}
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Verifying...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-pink-700">
            Didn't receive a code?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className={`
                font-medium text-pink-600 hover:text-pink-500 transition
                ${isResending ? 'text-pink-400' : ''}
              `}
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}