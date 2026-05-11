'use client';

import { useState } from 'react';
import { ToolEntryRow, type ToolEntryDraft } from './tool-entry-row';

const MAX_ENTRIES = 15;

function createEmptyEntry(): ToolEntryDraft {
  return {
    id: crypto.randomUUID(),
    toolName: '',
    planType: '',
    seats: '',
    monthlyCost: '',
  };
}

interface FieldErrors {
  [key: string]: string[] | undefined;
  entries?: string[];
}

export function AuditForm() {
  const [entries, setEntries] = useState<ToolEntryDraft[]>([createEmptyEntry()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function handleChange(
    index: number,
    field: keyof Omit<ToolEntryDraft, 'id'>,
    value: string
  ) {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    // Clear errors for this field on change
    setFieldErrors((prev) => {
      const key = `entries.${index}.${field}`;
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }

  function handleAdd() {
    if (entries.length < MAX_ENTRIES) {
      setEntries((prev) => [...prev, createEmptyEntry()]);
    }
  }

  function handleRemove(index: number) {
    if (entries.length > 1) {
      setEntries((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const payload = {
      entries: entries.map((entry) => ({
        toolName: entry.toolName,
        planType: entry.planType,
        seats: Number(entry.seats),
        monthlyCost: Number(entry.monthlyCost),
      })),
    };

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      if (response.redirected) {
        // Follow the redirect to the report page
        window.location.href = response.url;
        return;
      }

      if (response.status === 400) {
        const data = await response.json();
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setGeneralError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      // Fallback: if response is OK but not redirected, try to navigate
      const data = await response.json().catch(() => null);
      if (data?.auditId) {
        window.location.href = `/audit/${data.auditId}`;
      }
    } catch {
      setGeneralError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <ToolEntryRow
            key={entry.id}
            entry={entry}
            index={index}
            onChange={handleChange}
            onRemove={handleRemove}
            disableRemove={entries.length <= 1}
            errors={{
              toolName: fieldErrors[`entries.${index}.toolName`],
              planType: fieldErrors[`entries.${index}.planType`],
              seats: fieldErrors[`entries.${index}.seats`],
              monthlyCost: fieldErrors[`entries.${index}.monthlyCost`],
            }}
          />
        ))}
      </div>

      {/* Top-level entries error */}
      {fieldErrors.entries && (
        <p className="text-sm text-red-600" role="alert">
          {fieldErrors.entries[0]}
        </p>
      )}

      {/* General error */}
      {generalError && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          role="alert"
        >
          {generalError}
        </div>
      )}

      <div className="flex gap-3 items-center">
        <button
          type="button"
          onClick={handleAdd}
          disabled={entries.length >= MAX_ENTRIES}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          + Add Tool
        </button>

        <span className="text-sm text-gray-500">
          {entries.length}/{MAX_ENTRIES} tools
        </span>

        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-auto px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {isSubmitting ? 'Analyzing…' : 'Audit My Spend →'}
        </button>
      </div>
    </form>
  );
}
