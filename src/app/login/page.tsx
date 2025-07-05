"use client";

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-card-foreground">Welcome to Sahayak AI</h1>
          <p className="mt-2 text-muted-foreground">Sign in to continue to your personal AI assistant</p>
        </div>
        <Button 
          className="w-full gap-2"
          onClick={() => signIn('google', { callbackUrl: '/content-generation' })}
        >
          <FcGoogle className="w-5 h-5" />
          Sign in with Google
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
