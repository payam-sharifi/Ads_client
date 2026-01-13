"use client";

import React from "react";
import { useOffline } from "@/lib/hooks/useOffline";

const OfflineBanner: React.FC = () => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-100 border-b border-yellow-200 px-4 py-2 flex items-center justify-center animate-in slide-in-from-top duration-300">
      <div className="flex items-center space-x-2 rtl:space-x-reverse text-yellow-800 text-sm font-medium">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-yellow-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <span>
          You are currently offline. Some features may not be available.
          <span className="hidden md:inline"> (شما آفلاین هستید. برخی قابلیت‌ها در دسترس نیستند.)</span>
        </span>
      </div>
    </div>
  );
};

export default OfflineBanner;
