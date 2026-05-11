'use client';

import { useState } from 'react';

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable in some contexts
      console.error('Failed to copy to clipboard');
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      aria-label="Copy report link to clipboard"
    >
      {copied ? (
        <>
          <span aria-hidden="true">✓</span>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">🔗</span>
          <span>Copy Link</span>
        </>
      )}
    </button>
  );
}
