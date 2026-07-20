"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === false) router.push('/login');
  }, [user, router]);

  if (!user) {
    return <div className="min-h-[75vh] flex items-center justify-center text-kt-chocolate/60 font-sans">Loading your account...</div>;
  }

  return (
    <div className="min-h-[75vh] px-4 py-16 bg-kt-champagne">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-sm shadow-sm border border-kt-chocolate/5">
        <h1 className="font-serif text-3xl font-bold text-kt-chocolate mb-8">My Account</h1>
        <div className="space-y-4 mb-8">
          <div>
            <span className="block font-display text-xs tracking-wider uppercase text-kt-chocolate/50">Name</span>
            <span data-testid="account-name" className="font-sans text-lg text-kt-chocolate">{user.name}</span>
          </div>
          <div>
            <span className="block font-display text-xs tracking-wider uppercase text-kt-chocolate/50">Email</span>
            <span data-testid="account-email" className="font-sans text-lg text-kt-chocolate">{user.email}</span>
          </div>
        </div>
        <button
          data-testid="account-logout-button"
          onClick={async () => {
            await logout();
            router.push('/');
          }}
          className="px-6 py-3 bg-kt-rouge text-white font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-rouge/90 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
