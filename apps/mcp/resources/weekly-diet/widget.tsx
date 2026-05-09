import { useWidget, type WidgetMetadata } from "mcp-use/react";
import React, { useState } from "react";
import { z } from "zod";
import { weeklyDietSchema, type WeeklyDiet, type MealDay } from "../../src/lib/nutrition/types";
import { goalLabel, glycemicClass } from "../../src/lib/nutrition/derive";
import { SAMPLE_DIET } from "../../src/lib/nutrition/sample";

const propsSchema = z.object({
  diet: weeklyDietSchema.optional().describe("Plan semanal de alimentación. Si se omite, usa datos de muestra."),
});

export type WeeklyDietWidgetProps = z.infer<typeof propsSchema>;

export const widgetMetadata: WidgetMetadata = {
  description: "Muestra el plan de alimentación semanal personalizado con desayuno, comida, cena y colaciones por día.",
  props: propsSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Generando plan semanal…",
    invoked: "Plan listo",
  },
};

const MEAL_ICONS: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snacks: "🍎",
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Comida",
  dinner: "Cena",
  snacks: "Colaciones",
};

const DAY_SHORT: Record<string, string> = {
  "Lunes": "Lun",
  "Martes": "Mar",
  "Miércoles": "Mié",
  "Jueves": "Jue",
  "Viernes": "Vie",
  "Sábado": "Sáb",
  "Domingo": "Dom",
};

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${color}`}>
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}g</span>
    </span>
  );
}

function MealCard({ type, meal }: { type: string; meal: WeeklyDiet["days"][0]["breakfast"] }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{MEAL_ICONS[type]}</span>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {MEAL_LABELS[type]}
            </div>
            <div className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {meal.name}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {meal.calories}
          </div>
          <div className="text-[10px] text-neutral-500">kcal</div>
        </div>
      </div>
      {meal.description && (
        <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {meal.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        <MacroPill label="P" value={meal.macros.protein} color="bg-blue-50 text-blue-700 ring-blue-500/20 dark:bg-blue-900/20 dark:text-blue-400" />
        <MacroPill label="C" value={meal.macros.carbs} color="bg-orange-50 text-orange-700 ring-orange-500/20 dark:bg-orange-900/20 dark:text-orange-400" />
        <MacroPill label="G" value={meal.macros.fat} color="bg-yellow-50 text-yellow-700 ring-yellow-500/20 dark:bg-yellow-900/20 dark:text-yellow-400" />
        <MacroPill label="Fib" value={meal.macros.fiber} color="bg-green-50 text-green-700 ring-green-500/20 dark:bg-green-900/20 dark:text-green-400" />
      </div>
      {meal.glycemicIndex && (
        <div className="mt-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${glycemicClass(meal.glycemicIndex)}`}>
            IG {meal.glycemicIndex}
          </span>
        </div>
      )}
      {meal.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {meal.tags.map((tag) => (
            <span key={tag} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DayView({ day }: { day: MealDay }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{day.day}</h3>
        <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          {day.totalCalories} kcal totales
        </span>
      </div>
      <MealCard type="breakfast" meal={day.breakfast} />
      <MealCard type="lunch" meal={day.lunch} />
      <MealCard type="dinner" meal={day.dinner} />
      {day.snacks.map((snack, i) => (
        <MealCard key={i} type="snacks" meal={snack} />
      ))}
    </div>
  );
}

const WeeklyDietWidget: React.FC = () => {
  const { props } = useWidget<WeeklyDietWidgetProps>();
  const diet: WeeklyDiet = props?.diet ?? SAMPLE_DIET;
  const [activeIdx, setActiveIdx] = useState(0);

  const activeDay = diet.days[activeIdx] ?? diet.days[0];
  const goal = goalLabel(diet.goal);

  return (
    <div className="w-full p-4 text-neutral-900 dark:text-neutral-50">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        {/* Header */}
        <div className="border-b border-neutral-100 px-5 pt-5 pb-4 dark:border-neutral-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥗</span>
                <h1 className="text-xl font-semibold">Plan Semanal NutriMex</h1>
              </div>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {goal} · {diet.location ?? "México"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {diet.avgCalories}
              </div>
              <div className="text-[11px] text-neutral-500">prom. kcal/día</div>
            </div>
          </div>
          {/* Avg macros */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <MacroPill label="Proteína prom" value={diet.avgMacros.protein} color="bg-blue-50 text-blue-700 ring-blue-500/20 dark:bg-blue-900/20 dark:text-blue-400" />
            <MacroPill label="Carbs prom" value={diet.avgMacros.carbs} color="bg-orange-50 text-orange-700 ring-orange-500/20 dark:bg-orange-900/20 dark:text-orange-400" />
            <MacroPill label="Grasa prom" value={diet.avgMacros.fat} color="bg-yellow-50 text-yellow-700 ring-yellow-500/20 dark:bg-yellow-900/20 dark:text-yellow-400" />
            <MacroPill label="Fibra prom" value={diet.avgMacros.fiber} color="bg-green-50 text-green-700 ring-green-500/20 dark:bg-green-900/20 dark:text-green-400" />
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex overflow-x-auto border-b border-neutral-100 px-4 dark:border-neutral-800">
          {diet.days.map((day, i) => (
            <button
              key={day.day}
              onClick={() => setActiveIdx(i)}
              className={`shrink-0 px-3 py-2.5 text-xs font-medium transition-colors ${
                i === activeIdx
                  ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              <div>{DAY_SHORT[day.day]}</div>
              <div className="mt-0.5 tabular-nums text-[10px] opacity-75">{day.totalCalories}</div>
            </button>
          ))}
        </div>

        {/* Day content */}
        <div className="p-4">
          <DayView day={activeDay} />
        </div>
      </div>
    </div>
  );
};

export default WeeklyDietWidget;
