import { useWidget, type WidgetMetadata } from "mcp-use/react";
import React from "react";
import { z } from "zod";
import { nutritionSummarySchema, type NutritionSummary } from "../../src/lib/nutrition/types";
import { goalLabel, healthScoreLabel, macroPercents } from "../../src/lib/nutrition/derive";
import { SAMPLE_SUMMARY } from "../../src/lib/nutrition/sample";

const propsSchema = z.object({
  summary: nutritionSummarySchema.optional().describe("Resumen nutricional. Si se omite, usa datos de muestra."),
});

export type NutritionChartWidgetProps = z.infer<typeof propsSchema>;

export const widgetMetadata: WidgetMetadata = {
  description: "Muestra gráficas de calorías semanales, distribución de macronutrimentos y puntuación de salud.",
  props: propsSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Calculando nutrición…",
    invoked: "Gráficas listas",
  },
};

function MacrosDonut({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  const pcts = macroPercents({ protein, carbs, fat });

  const proteinDash = (pcts.protein / 100) * circ;
  const carbsDash = (pcts.carbs / 100) * circ;
  const fatDash = (pcts.fat / 100) * circ;

  const startOffset = circ * 0.25;
  const proteinOffset = startOffset;
  const carbsOffset = startOffset - proteinDash;
  const fatOffset = startOffset - proteinDash - carbsDash;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="18" />
        {/* Protein - blue */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="18"
          strokeDasharray={`${proteinDash} ${circ}`} strokeDashoffset={proteinOffset} strokeLinecap="butt" />
        {/* Carbs - orange */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f97316" strokeWidth="18"
          strokeDasharray={`${carbsDash} ${circ}`} strokeDashoffset={carbsOffset} strokeLinecap="butt" />
        {/* Fat - yellow */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eab308" strokeWidth="18"
          strokeDasharray={`${fatDash} ${circ}`} strokeDashoffset={fatOffset} strokeLinecap="butt" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">Macros</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#111827">{protein + carbs + fat}g</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-2 text-[11px]">
        <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-blue-500 inline-block" />Proteína {pcts.protein}%</span>
        <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-orange-500 inline-block" />Carbs {pcts.carbs}%</span>
        <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-yellow-500 inline-block" />Grasa {pcts.fat}%</span>
      </div>
    </div>
  );
}

function CalorieBars({ data, target }: { data: { day: string; calories: number }[]; target?: number }) {
  const max = Math.max(...data.map((d) => d.calories), target ?? 0, 1);
  const barH = 120;

  return (
    <div>
      <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">Calorías por día</div>
      <svg width="100%" viewBox={`0 0 ${data.length * 36} ${barH + 24}`} preserveAspectRatio="xMidYMid meet">
        {/* Target line */}
        {target && (
          <>
            <line
              x1="0" y1={barH - (target / max) * barH}
              x2={data.length * 36} y2={barH - (target / max) * barH}
              stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6"
            />
            <text x={data.length * 36 - 2} y={barH - (target / max) * barH - 3}
              textAnchor="end" fontSize="8" fill="#ef4444" opacity="0.8">
              Meta {target}
            </text>
          </>
        )}
        {data.map((d, i) => {
          const h = Math.max((d.calories / max) * barH, 4);
          const over = target ? d.calories > target : false;
          return (
            <g key={d.day} transform={`translate(${i * 36 + 4}, 0)`}>
              <rect
                x="0" y={barH - h} width="28" height={h} rx="4"
                fill={over ? "#f97316" : "#10b981"} opacity="0.85"
              />
              <text x="14" y={barH - h - 3} textAnchor="middle" fontSize="8" fill="#6b7280">
                {d.calories}
              </text>
              <text x="14" y={barH + 12} textAnchor="middle" fontSize="8" fill="#9ca3af">
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
      {target && (
        <div className="mt-1 flex gap-3 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-emerald-500 inline-block" />Dentro del objetivo</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-orange-500 inline-block" />Por encima</span>
        </div>
      )}
    </div>
  );
}

function HealthScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const { label, color } = healthScoreLabel(score);
  const strokeColor = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={strokeColor} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ * 0.25}
          strokeLinecap="round" />
        <text x="45" y="41" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#111827">{score}</text>
        <text x="45" y="54" textAnchor="middle" fontSize="8" fill="#9ca3af">/100</text>
      </svg>
      <div className={`text-xs font-semibold ${color}`}>{label}</div>
      <div className="text-[10px] text-neutral-500">Score de salud</div>
    </div>
  );
}

function NutrientRow({ label, value, unit, max, color }: {
  label: string; value: number; unit: string; max: number; color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-0.5">
        <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
        <span className="font-medium tabular-nums text-neutral-800 dark:text-neutral-200">{value}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const NutritionChartWidget: React.FC = () => {
  const { props } = useWidget<NutritionChartWidgetProps>();
  const summary: NutritionSummary = props?.summary ?? SAMPLE_SUMMARY;
  const goal = goalLabel(summary.goal);

  return (
    <div className="w-full p-4 text-neutral-900 dark:text-neutral-50">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        {/* Header */}
        <div className="border-b border-neutral-100 px-5 pt-5 pb-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <h1 className="text-xl font-semibold">Análisis Nutricional</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{goal}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Top row: donut + health score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-neutral-100 p-4 dark:border-neutral-800">
              <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">Macros promedio / día</div>
              <MacrosDonut
                protein={summary.avgMacros.protein}
                carbs={summary.avgMacros.carbs}
                fat={summary.avgMacros.fat}
              />
            </div>
            <div className="rounded-xl border border-neutral-100 p-4 dark:border-neutral-800 flex flex-col items-center justify-center gap-3">
              <HealthScoreRing score={summary.healthScore} />
              <div className="w-full space-y-2">
                <NutrientRow label="Fibra" value={summary.avgMacros.fiber} unit="g" max={38} color="bg-green-500" />
                {summary.avgSodium && (
                  <NutrientRow label="Sodio" value={summary.avgSodium} unit="mg" max={2300} color="bg-amber-500" />
                )}
                {summary.avgSugar && (
                  <NutrientRow label="Azúcar" value={summary.avgSugar} unit="g" max={50} color="bg-red-400" />
                )}
              </div>
            </div>
          </div>

          {/* Calorie bars */}
          <div className="rounded-xl border border-neutral-100 p-4 dark:border-neutral-800">
            <CalorieBars data={summary.weeklyCalories} target={summary.targetCalories} />
          </div>

          {/* Macros detail */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Proteína", value: summary.avgMacros.protein, unit: "g/día", color: "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
              { label: "Carbohidratos", value: summary.avgMacros.carbs, unit: "g/día", color: "bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800", text: "text-orange-700 dark:text-orange-400" },
              { label: "Grasa", value: summary.avgMacros.fat, unit: "g/día", color: "bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800", text: "text-yellow-700 dark:text-yellow-400" },
              { label: "Fibra", value: summary.avgMacros.fiber, unit: "g/día", color: "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800", text: "text-green-700 dark:text-green-400" },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl border p-3 ${m.color}`}>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{m.label}</div>
                <div className={`mt-1 text-xl font-bold tabular-nums ${m.text}`}>{m.value}g</div>
                <div className="text-[10px] text-neutral-500">{m.unit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionChartWidget;
