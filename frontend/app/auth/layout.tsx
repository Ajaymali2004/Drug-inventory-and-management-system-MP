'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side with 3D Image and gradient background */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400">
        <div className="relative w-4/5 h-4/5">
          <Image
            src="/3d-illustration2.png"
            alt="Authentication 3D Illustration"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>

      {/* Right side with the form (no gradient, clean) */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
