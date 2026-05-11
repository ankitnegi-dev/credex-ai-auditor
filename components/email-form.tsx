'use client';

import { useActionState } from 'react';

interface EmailFormState {
  status: 'idle' | 'success' | 'error' | 'duplicate';
  message: string;
}

const initialState: EmailFormState = {
  status: 'idle',
  message: '',
};

interface EmailFormProps {
  auditId: string;
}

async function submitEmail(
  auditId: string,
  _prevState: EmailFormState,
  formData: FormData
): Promise<EmailFormState> {
  const email = formData.get('email') as string;

  if (!email) {
    return { status: 'error', message: 'Please enter an email address.' };
  }

  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditId, email }),
    });

    if (response.ok) {
      return {
        status: 'success',
        message: `Report sent to ${email}. Check your inbox!`,
      };
    }

    const data = await response.json().catch(() => ({}));

    if (response.status === 409) {
      return {
        status: 'duplicate',
        message: data.error ?? 'This report has already been sent to that address.',
      };
    }

    if (response.status === 400) {
      return {
        status: 'error',
        message: data.fieldErrors?.email?.[0] ?? data.error ?? 'Invalid email address.',
      };
    }

    return {
      status: 'error',
      message: data.error ?? 'Failed to send email. Please try again.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

export function EmailForm({ auditId }: EmailFormProps) {
  const boundAction = submitEmail.bind(null, auditId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const isDisabled = isPending || state.status === 'success' || state.status === 'duplicate';

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Email This Report</h3>
      <p className="text-sm text-gray-500 mb-4">
        Get a permanent copy of your audit results in your inbox.
      </p>

      {state.status === 'success' && (
        <div
          className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4"
          role="status"
        >
          ✓ {state.message}
        </div>
      )}

      {state.status === 'duplicate' && (
        <div
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 mb-4"
          role="status"
        >
          ℹ {state.message}
        </div>
      )}

      {state.status === 'error' && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4"
          role="alert"
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="email-input" className="sr-only">
            Email address
          </label>
          <input
            id="email-input"
            name="email"
            type="email"
            placeholder="you@startup.com"
            disabled={isDisabled}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            aria-label="Email address"
          />
        </div>
        <button
          type="submit"
          disabled={isDisabled}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
        >
          {isPending ? 'Sending…' : 'Send Report'}
        </button>
      </form>
    </div>
  );
}
