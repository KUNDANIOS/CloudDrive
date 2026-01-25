'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle } from 'lucide-react';

// CRITICAL FIX: Force this page to be dynamic (prevents build-time rendering)
export const dynamic = 'force-dynamic';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResend = async () => {
    if (!email) {
      setMessage('Email not found. Please sign up again.');
      setSuccess(false);
      setTimeout(() => router.push('/signup'), 2000);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      setMessage('Verification email sent! Check your inbox.');
      setSuccess(true);
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend email. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Check your inbox to activate your account"
    >
      <div className="space-y-6 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Email display */}
        {email && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We've sent a verification link to:
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-100 break-words">
              {email}
            </p>
          </div>
        )}

        {/* Status message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            {success && <CheckCircle className="w-4 h-4 inline mr-2" />}
            {message}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Button 
            fullWidth 
            onClick={handleResend}
            loading={loading}
            disabled={!email || loading}
          >
            {loading ? 'Sending...' : 'Resend verification email'}
          </Button>

          <Button 
            variant="secondary" 
            fullWidth 
            onClick={() => router.push('/login')}
          >
            Go to login
          </Button>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthCard title="Verify your email" subtitle="Loading...">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthCard>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}