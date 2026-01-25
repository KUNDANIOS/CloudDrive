'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleResend = async () => {
    if (!email) {
      alert('Email not found. Please login again.');
      router.push('/login');
      return;
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Verification email resent. Please check your inbox.');
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Check your inbox to activate your account"
    >
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We’ve sent a verification link to:
          <br />
          <strong>{email}</strong>
        </p>

        <Button fullWidth onClick={handleResend}>
          Resend verification email
        </Button>

        <Button variant="secondary" fullWidth onClick={() => router.push('/login')}>
          Go to login
        </Button>
      </div>
    </AuthCard>
  );
}
