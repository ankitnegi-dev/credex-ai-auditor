// A single tool entry as submitted by the user
export interface ToolEntry {
  toolName: string;      // must match a key in PRICING_CATALOG exactly
  planType: string;      // user-reported plan (Free | Pro | Team | Enterprise)
  seats: number;         // >= 1
  monthlyCost: number;   // >= 0, user-reported monthly cost in USD
}

// A plan tier within the Pricing Catalog
export interface PlanTier {
  name: string;          // e.g. "Pro", "Team", "Business"
  pricePerSeat: number;  // USD per seat per month, >= 0
  minSeats: number;      // minimum seat threshold, >= 1
}

// A tool entry in the Pricing Catalog
export interface CatalogTool {
  plans: PlanTier[];
}

// The full Pricing Catalog
export type PricingCatalog = Record<string, CatalogTool>;

// Result of running the Audit Engine on a single ToolEntry
export interface ToolAuditResult {
  toolName: string;
  userPlan: string;
  userMonthlyCost: number;
  optimizedPlanName: string;
  optimizedMonthlyCost: number;  // optimizedPlan.pricePerSeat * seats, rounded to 2dp
  savings: number;               // >= 0, rounded to 2dp
}

// Full audit computation result (before persistence)
export interface AuditResult {
  toolResults: ToolAuditResult[];
  totalSpend: number;            // sum of userMonthlyCost, rounded to 2dp
  totalOptimizedSpend: number;   // sum of optimizedMonthlyCost, rounded to 2dp
  totalSavings: number;          // sum of savings, rounded to 2dp
}

// The record stored in Supabase
export interface AuditRecord {
  id: string;                    // UUID v4
  tool_results: ToolAuditResult[];
  total_spend: number;
  total_optimized_spend: number;
  total_savings: number;
  summary: string;               // Claude-generated text, or "" if unavailable
  created_at: string;            // ISO 8601 timestamp
}

// Email record stored in Supabase
export interface EmailRecord {
  id: string;                    // UUID v4
  audit_id: string;              // FK → audits.id
  email: string;
  sent_at: string;               // ISO 8601 timestamp
}
