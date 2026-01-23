'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { Shield } from 'lucide-react';
import Cookies from 'js-cookie';

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  
  const emailParam = searchParams.get('email') || '';
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.verify2FA(emailParam, otp);
      
      // Store auth data
      Cookies.set('token', response.token, { expires: 7 });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Two-Factor Authentication"
      subtitle="Enter the code sent to your email"
    >
      <form onSubmit={handleVerify} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit code to <strong>{emailParam}</strong>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Authentication Code
          </label>
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            autoFocus
            className="text-center text-2xl tracking-widest"
          />
        </div>

        <Button type="submit" fullWidth loading={loading} disabled={otp.length !== 6}>
          Verify & Continue
        </Button>
      </form>
    </AuthCard>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <AuthCard title="Two-Factor Authentication" subtitle="Loading...">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthCard>
    }>
      <Verify2FAContent />
    </Suspense>
  );
}