// Auto-generated tool registry types - DO NOT EDIT MANUALLY
// This file is regenerated whenever tools are added, removed, or updated during development
// Generated at: 2026-05-09T22:48:43.768Z

declare module "mcp-use/react" {
  interface ToolRegistry {
    "check-cofepris": {
      input: { "product": string };
      output: Record<string, unknown>;
    };
    "find-healthy-options": {
      input: { "goal": "control_diabetes" | "perder_peso" | "mejorar_nutricion" | "mantener_peso"; "location"?: string | undefined; "budget"?: number | undefined };
      output: Record<string, unknown>;
    };
    "show-nutrition-chart": {
      input: { "goal"?: "control_diabetes" | "perder_peso" | "mejorar_nutricion" | "mantener_peso" | undefined; "targetCalories"?: number | undefined };
      output: Record<string, unknown>;
    };
    "show-shopping-cart": {
      input: { "store"?: "OXXO" | "7-Eleven" | "Walmart Express" | "Soriana" | undefined; "week"?: string | undefined };
      output: Record<string, unknown>;
    };
    "show-ticket-comparison": {
      input: { "location"?: string | undefined; "store"?: "OXXO" | "7-Eleven" | "Walmart Express" | "Soriana" | undefined };
      output: Record<string, unknown>;
    };
    "show-weekly-diet": {
      input: { "goal"?: "control_diabetes" | "perder_peso" | "mejorar_nutricion" | "mantener_peso" | undefined; "location"?: string | undefined };
      output: Record<string, unknown>;
    };
  }
}

export {};
