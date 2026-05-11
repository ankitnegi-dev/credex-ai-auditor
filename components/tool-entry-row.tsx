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

export function ToolEntryRow({
  entry,
  index,
  onChange,
  onRemove,
  disableRemove,
  errors,
}: ToolEntryRowProps) {
  return (
    <div className="flex flex-wrap gap-3 items-start p-4 border border-gray-200 rounded-lg bg-white">
      {/* Tool Name */}
      <div className="flex flex-col gap-1 min-w-[160px] flex-1">
        <label htmlFor={`toolName-${index}`} className="text-sm font-medium text-gray-700">
          Tool
        </label>
        <select
          id={`toolName-${index}`}
          value={entry.toolName}
          onChange={(e) => onChange(index, 'toolName', e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby={errors?.toolName ? `toolName-error-${index}` : undefined}
        >
          <option value="">Select a tool…</option>
          {TOOL_OPTIONS.map((tool) => (
            <option key={tool} value={tool}>
              {tool}
            </option>
          ))}
        </select>
        {errors?.toolName && (
          <p id={`toolName-error-${index}`} className="text-xs text-red-600" role="alert">
            {errors.toolName[0]}
          </p>
        )}
      </div>

      {/* Plan Type */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <label htmlFor={`planType-${index}`} className="text-sm font-medium text-gray-700">
          Plan
        </label>
        <select
          id={`planType-${index}`}
          value={entry.planType}
          onChange={(e) => onChange(index, 'planType', e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby={errors?.planType ? `planType-error-${index}` : undefined}
        >
          <option value="">Select…</option>
          {PLAN_OPTIONS.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
        {errors?.planType && (
          <p id={`planType-error-${index}`} className="text-xs text-red-600" role="alert">
            {errors.planType[0]}
          </p>
        )}
      </div>

      {/* Seats */}
      <div className="flex flex-col gap-1 w-24">
        <label htmlFor={`seats-${index}`} className="text-sm font-medium text-gray-700">
          Seats
        </label>
        <input
          id={`seats-${index}`}
          type="number"
          min={1}
          value={entry.seats}
          onChange={(e) => onChange(index, 'seats', e.target.value)}
          placeholder="1"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby={errors?.seats ? `seats-error-${index}` : undefined}
        />
        {errors?.seats && (
          <p id={`seats-error-${index}`} className="text-xs text-red-600" role="alert">
            {errors.seats[0]}
          </p>
        )}
      </div>

      {/* Monthly Cost */}
      <div className="flex flex-col gap-1 w-32">
        <label htmlFor={`monthlyCost-${index}`} className="text-sm font-medium text-gray-700">
          Monthly Cost ($)
        </label>
        <input
          id={`monthlyCost-${index}`}
          type="number"
          min={0}
          step="0.01"
          value={entry.monthlyCost}
          onChange={(e) => onChange(index, 'monthlyCost', e.target.value)}
          placeholder="0.00"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby={errors?.monthlyCost ? `monthlyCost-error-${index}` : undefined}
        />
        {errors?.monthlyCost && (
          <p id={`monthlyCost-error-${index}`} className="text-xs text-red-600" role="alert">
            {errors.monthlyCost[0]}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <div className="flex flex-col justify-end pb-1">
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={disableRemove}
          className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={`Remove tool entry ${index + 1}`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
