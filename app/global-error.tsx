"use client";

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Zenith GlobalError] Uncaught layout failure:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-[#F7F6F3] text-[#3D3D3D] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-3xl border border-[#E2DFD9] bg-white p-8 text-center shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#F7EDEB] text-[#C4756E] border border-[#C4756E]/30 flex items-center justify-center mx-auto mb-4 font-serif text-xl font-bold">
            Z
          </div>
          <h2 className="font-serif text-2xl text-[#3D3D3D] tracking-tight mb-2">
            System Rhythm Reset
          </h2>
          <p className="text-xs text-[#8A8A85] leading-relaxed mb-6 font-light">
            A critical system disruption occurred. Your circadian data remains safely persisted in local storage.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-[#7A9A77] hover:bg-[#8BA888] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Reload Application
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-xl border border-[#E2DFD9] bg-[#F7F6F3] text-xs font-semibold text-[#3D3D3D] transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

