import type { CofeprisStatus, HealthGoal, Store, TicketComparison } from "./types";

export function cofeprisClass(status: CofeprisStatus): string {
  switch (status) {
    case "approved": return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400";
    case "warning": return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400";
    case "alert": return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400";
    default: return "bg-neutral-50 text-neutral-500 ring-neutral-600/20 dark:bg-neutral-800 dark:text-neutral-400";
  }
}

export function cofeprisLabel(status: CofeprisStatus): string {
  switch (status) {
    case "approved": return "✓ COFEPRIS OK";
    case "warning": return "⚠ Advertencia";
    case "alert": return "🔴 Alerta";
    default: return "? Sin datos";
  }
}

export function cofeprisEmoji(status: CofeprisStatus): string {
  switch (status) {
    case "approved": return "✅";
    case "warning": return "⚠️";
    case "alert": return "🔴";
    default: return "❓";
  }
}

export function goalLabel(goal?: HealthGoal): string {
  switch (goal) {
    case "control_diabetes": return "Control de Diabetes";
    case "perder_peso": return "Pérdida de Peso";
    case "mejorar_nutricion": return "Mejorar Nutrición";
    case "mantener_peso": return "Mantener Peso";
    default: return "Alimentación Saludable";
  }
}

export function storeEmoji(store: Store): string {
  switch (store) {
    case "OXXO": return "🏪";
    case "7-Eleven": return "🟢";
    case "Walmart Express": return "🛒";
    case "Soriana": return "🏬";
  }
}

export function cheapestStore(ticket: TicketComparison): Store | null {
  if (!ticket.storeTotals.length) return null;
  return ticket.storeTotals.reduce(
    (min, s) => s.total < min.total ? s : min,
    ticket.storeTotals[0],
  ).store;
}

export function savingsAmount(ticket: TicketComparison): number {
  if (ticket.storeTotals.length < 2) return 0;
  const max = Math.max(...ticket.storeTotals.map((s) => s.total));
  const min = Math.min(...ticket.storeTotals.map((s) => s.total));
  return max - min;
}

export function healthScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excelente", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 60) return { label: "Bueno", color: "text-blue-600 dark:text-blue-400" };
  if (score >= 40) return { label: "Regular", color: "text-amber-600 dark:text-amber-400" };
  return { label: "Mejorable", color: "text-red-600 dark:text-red-400" };
}

export function glycemicClass(gi?: string): string {
  switch (gi) {
    case "bajo": return "bg-emerald-50 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-400";
    case "medio": return "bg-amber-50 text-amber-700 ring-amber-500/20 dark:bg-amber-900/20 dark:text-amber-400";
    case "alto": return "bg-red-50 text-red-700 ring-red-500/20 dark:bg-red-900/20 dark:text-red-400";
    default: return "bg-neutral-100 text-neutral-500 ring-neutral-300/20";
  }
}

export function macroPercents(macros: { protein: number; carbs: number; fat: number }): {
  protein: number; carbs: number; fat: number;
} {
  const total = macros.protein + macros.carbs + macros.fat;
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: Math.round((macros.protein / total) * 100),
    carbs: Math.round((macros.carbs / total) * 100),
    fat: Math.round((macros.fat / total) * 100),
  };
}
