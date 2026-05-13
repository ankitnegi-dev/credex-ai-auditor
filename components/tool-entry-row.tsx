'use client';

const TOOL_OPTIONS = [
  'ChatGPT',
  'Claude',
  'Cursor',
  'GitHub Copilot',
  'Midjourney',
  'Gemini',
  'Perplexity',
  'Notion AI',
  'Grammarly',
  'Jasper',
  'Copy.ai',
  'Runway',
  'ElevenLabs',
  'Synthesia',
  'Otter.ai',
] as const;

const PLAN_OPTIONS = ['Free', 'Pro', 'Team', 'Enterprise'] as const;

export interface ToolEntryDraft {
  id: string;
  toolName: string;
  planType: string;
  seats: string;
  monthlyCost: string;
}

interface ToolEntryRowProps {
  entry: ToolEntryDraft;
  index: number;
  onChange: (index: number, field: keyof Omit<ToolEntryDraft, 'id'>, value: string) => void;
  onRemove: (index: number) => void;
  disableRemove: boolean;
  errors?: {
    toolName?: string[];
    planType?: string[];
    seats?: string[];
    monthlyCost?: string[];
  };
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400';

const labelClass = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1';

export function ToolEntryRow({
  entry,
  index,
  onChange,
  onRemove,
  disableRemove,
  errors,
}: ToolEntryRowProps) {
  return (
    <div className="grid grid-cols-12 gap-3 items-start p-4 border border-gray-200 rounded-xl bg-gray-50 hover:border-blue-300 transition-colors">
      {/* Tool Name — 4 cols */}
      <div className="col-span-12 sm:col-span-4">
        <label htmlFor={`toolName-${index}`} className={labelClass}>
          AI Tool
        </label>
        <select
          id={`toolName-${index}`}
          value={entry.toolName}
          onChange={(e) => onChange(index, 'toolName', e.target.value)}
          className={inputClass}
          aria-describedby={errors?.toolName ? `toolName-error-${index}` : undefined}
        >
          <option value="" disabled>Select a tool…</option>
          {TOOL_OPTIONS.map((tool) => (
            <option key={tool} value={tool}>
              {tool}
            </option>
          ))}
        </select>
        {errors?.toolName && (
          <p id={`toolName-error-${index}`} className="mt-1 text-xs text-red-600" role="alert">
            {errors.toolName[0]}
          </p>
        )}
      </div>

      {/* Plan Type — 2 cols */}
      <div className="col-span-6 sm:col-span-2">
        <label htmlFor={`planType-${index}`} className={labelClass}>
          Plan
        </label>
        <select
          id={`planType-${index}`}
          value={entry.planType}
          onChange={(e) => onChange(index, 'planType', e.target.value)}
          className={inputClass}
          aria-describedby={errors?.planType ? `planType-error-${index}` : undefined}
        >
          <option value="" disabled>Select…</option>
          {PLAN_OPTIONS.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
        {errors?.planType && (
          <p id={`planType-error-${index}`} className="mt-1 text-xs text-red-600" role="alert">
            {errors.planType[0]}
          </p>
        )}
      </div>

      {/* Seats — 2 cols */}
      <div className="col-span-6 sm:col-span-2">
        <label htmlFor={`seats-${index}`} className={labelClass}>
          Seats
        </label>
        <input
          id={`seats-${index}`}
          type="number"
          min={1}
          value={entry.seats}
          onChange={(e) => onChange(index, 'seats', e.target.value)}
          placeholder="1"
          className={inputClass}
          aria-describedby={errors?.seats ? `seats-error-${index}` : undefined}
        />
        {errors?.seats && (
          <p id={`seats-error-${index}`} className="mt-1 text-xs text-red-600" role="alert">
            {errors.seats[0]}
          </p>
        )}
      </div>

      {/* Monthly Cost — 3 cols */}
      <div className="col-span-10 sm:col-span-3">
        <label htmlFor={`monthlyCost-${index}`} className={labelClass}>
          Monthly Cost ($)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
          <input
            id={`monthlyCost-${index}`}
            type="number"
            min={0}
            step="0.01"
            value={entry.monthlyCost}
            onChange={(e) => onChange(index, 'monthlyCost', e.target.value)}
            placeholder="0.00"
            className={`${inputClass} pl-7`}
            aria-describedby={errors?.monthlyCost ? `monthlyCost-error-${index}` : undefined}
          />
        </div>
        {errors?.monthlyCost && (
          <p id={`monthlyCost-error-${index}`} className="mt-1 text-xs text-red-600" role="alert">
            {errors.monthlyCost[0]}
          </p>
        )}
      </div>

      {/* Remove Button — 1 col */}
      <div className="col-span-2 sm:col-span-1 flex items-end pb-0.5">
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={disableRemove}
          className="w-full flex items-center justify-center h-[38px] text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
          aria-label={`Remove tool entry ${index + 1}`}
          title="Remove"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
