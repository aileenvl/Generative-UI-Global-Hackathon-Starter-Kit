import { MCPServer, text, widget, error, object } from "mcp-use/server";
import { z } from "zod";
import {
  weeklyDietSchema,
  ticketComparisonSchema,
  nutritionSummarySchema,
  shoppingCartSchema,
  STORES,
  HEALTH_GOALS,
} from "./src/lib/nutrition/types";
import {
  SAMPLE_DIET,
  SAMPLE_TICKET,
  SAMPLE_CART,
  SAMPLE_SUMMARY,
  COFEPRIS_DB,
} from "./src/lib/nutrition/sample";
import { cheapestStore, goalLabel, savingsAmount } from "./src/lib/nutrition/derive";

const server = new MCPServer({
  name: "nutrimex-mcp",
  title: "NutriMex",
  version: "1.0.0",
  description:
    "Asistente nutricional para el control de diabetes y obesidad en México. Genera planes de dieta semanales, compara precios en tiendas de conveniencia y verifica el estado COFEPRIS de los productos.",
  baseUrl: process.env.MCP_URL || "http://localhost:3011",
  favicon: "favicon.ico",
  websiteUrl: "https://mcp-use.com",
  icons: [
    {
      src: "icon.svg",
      mimeType: "image/svg+xml",
      sizes: ["512x512"],
    },
  ],
});

// ─── Tool 1: Weekly Diet Plan ──────────────────────────────────────────────

server.tool(
  {
    name: "show-weekly-diet",
    description:
      "Muestra el plan de alimentación semanal personalizado para el control de diabetes u obesidad. Incluye desayuno, comida, cena y colaciones con macronutrimentos, índice glucémico y etiquetas nutricionales por día.",
    schema: z.object({
      goal: z
        .enum(HEALTH_GOALS)
        .optional()
        .describe("Objetivo de salud del usuario. Omitir para usar datos de muestra."),
      location: z
        .string()
        .optional()
        .describe("Ciudad del usuario, ej: 'Ciudad de México', 'Monterrey'."),
    }),
    widget: {
      name: "weekly-diet",
      invoking: "Generando plan semanal…",
      invoked: "Plan listo",
    },
  },
  async ({ goal, location }) => {
    const diet = {
      ...SAMPLE_DIET,
      goal: goal ?? SAMPLE_DIET.goal,
      location: location ?? SAMPLE_DIET.location,
    };

    return widget({
      props: { diet },
      output: text(
        `Plan semanal generado para ${goalLabel(diet.goal)} en ${diet.location}. ` +
        `Promedio: ${diet.avgCalories} kcal/día · ${diet.days.length} días planificados.`,
      ),
    });
  },
);

// ─── Tool 2: Ticket Comparison ─────────────────────────────────────────────

server.tool(
  {
    name: "show-ticket-comparison",
    description:
      "Compara el costo total de la canasta de alimentos de la dieta en OXXO, 7-Eleven, Walmart Express y Soriana. Resalta el precio más barato por producto y el total más económico por tienda. Incluye estado COFEPRIS de cada producto.",
    schema: z.object({
      location: z
        .string()
        .optional()
        .describe("Ciudad o colonia, ej: 'CDMX', 'Guadalajara'."),
      store: z
        .enum(STORES)
        .optional()
        .describe("Pre-seleccionar una tienda en el comparador."),
    }),
    widget: {
      name: "ticket-comparison",
      invoking: "Consultando precios en tiendas…",
      invoked: "Precios comparados",
    },
  },
  async ({ location, store }) => {
    const ticket = {
      ...SAMPLE_TICKET,
      location: location ?? SAMPLE_TICKET.location,
      recommendedStore: store ?? SAMPLE_TICKET.recommendedStore,
    };

    const cheapest = cheapestStore(ticket);
    const savings = savingsAmount(ticket);
    const cheapestTotal = ticket.storeTotals.find((s) => s.store === cheapest)?.total ?? 0;

    return widget({
      props: { ticket },
      output: text(
        `Comparación de ${ticket.products.length} productos en ${ticket.stores.length} tiendas. ` +
        `Mejor opción: ${cheapest} con $${cheapestTotal} MXN. ` +
        `Ahorro potencial: $${savings} MXN vs. la tienda más cara.`,
      ),
    });
  },
);

// ─── Tool 3: Nutrition Chart ───────────────────────────────────────────────

server.tool(
  {
    name: "show-nutrition-chart",
    description:
      "Muestra gráficas del análisis nutricional semanal: distribución de macronutrimentos (proteína, carbohidratos, grasa), calorías por día vs. meta, puntuación de salud (0–100), fibra, sodio y azúcar promedio.",
    schema: z.object({
      goal: z
        .enum(HEALTH_GOALS)
        .optional()
        .describe("Objetivo de salud para contextualizar las gráficas."),
      targetCalories: z
        .number()
        .optional()
        .describe("Calorías objetivo por día para mostrar la línea de referencia."),
    }),
    widget: {
      name: "nutrition-chart",
      invoking: "Calculando análisis nutricional…",
      invoked: "Gráficas listas",
    },
  },
  async ({ goal, targetCalories }) => {
    const summary = {
      ...SAMPLE_SUMMARY,
      goal: goal ?? SAMPLE_SUMMARY.goal,
      targetCalories: targetCalories ?? SAMPLE_SUMMARY.targetCalories,
    };

    return widget({
      props: { summary },
      output: text(
        `Análisis nutricional para ${goalLabel(summary.goal)}. ` +
        `Score de salud: ${summary.healthScore}/100. ` +
        `Macros prom/día — Proteína: ${summary.avgMacros.protein}g, ` +
        `Carbs: ${summary.avgMacros.carbs}g, Grasa: ${summary.avgMacros.fat}g, ` +
        `Fibra: ${summary.avgMacros.fiber}g.`,
      ),
    });
  },
);

// ─── Tool 4: Shopping Cart ─────────────────────────────────────────────────

server.tool(
  {
    name: "show-shopping-cart",
    description:
      "Muestra el ticket de compra optimizado: lista de productos con cantidades, precios, estado COFEPRIS y total en la tienda más económica. Incluye advertencias sanitarias si algún producto tiene sellos de la NOM-051.",
    schema: z.object({
      store: z
        .enum(STORES)
        .optional()
        .describe("Tienda donde se realizará la compra. Si se omite, usa la más económica de la comparativa."),
      week: z
        .string()
        .optional()
        .describe("Semana de la compra, ej: '12–18 Mayo 2025'."),
    }),
    widget: {
      name: "shopping-cart",
      invoking: "Armando ticket de compra…",
      invoked: "Ticket listo",
    },
  },
  async ({ store, week }) => {
    const cart = {
      ...SAMPLE_CART,
      store: store ?? SAMPLE_CART.store,
      week: week ?? SAMPLE_CART.week,
    };

    const alertCount = cart.items.filter((i) => i.product.cofeprisStatus === "alert").length;
    const warningCount = cart.items.filter((i) => i.product.cofeprisStatus === "warning").length;
    const cofeprisNote = alertCount > 0 || warningCount > 0
      ? ` ⚠️ ${alertCount + warningCount} producto(s) con advertencias COFEPRIS.`
      : " ✅ Todos los productos tienen estado COFEPRIS aprobado.";

    return widget({
      props: { cart },
      output: text(
        `Ticket de ${cart.items.length} productos en ${cart.store} · Total: $${cart.subtotal} MXN.` +
        (cart.savingsVsMax ? ` Ahorro: $${cart.savingsVsMax} MXN.` : "") +
        cofeprisNote,
      ),
    });
  },
);

// ─── Tool 5: COFEPRIS Check ────────────────────────────────────────────────

server.tool(
  {
    name: "check-cofepris",
    description:
      "Verifica el estado sanitario de un producto alimenticio en la base de datos de COFEPRIS (Comisión Federal para la Protección contra Riesgos Sanitarios de México). Retorna sellos de advertencia, nivel de alerta y recomendaciones para personas con diabetes u obesidad.",
    schema: z.object({
      product: z
        .string()
        .describe("Nombre del producto a verificar, ej: 'Coca-Cola', 'Avena Quaker', 'Gansito'."),
    }),
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ product }) => {
    const key = product.toLowerCase().trim();
    const found = Object.entries(COFEPRIS_DB).find(([k]) => key.includes(k) || k.includes(key));

    if (!found) {
      return text(
        `COFEPRIS — "${product}"\n` +
        `❓ Sin datos en la base de consulta.\n` +
        `Recomendación: Verificar el etiquetado físico del producto según NOM-051-SCFI/SSA1-2010. ` +
        `Productos sin sellos de advertencia son preferibles para personas con diabetes u obesidad.`,
      );
    }

    const [, info] = found;
    const emoji = info.status === "approved" ? "✅" : info.status === "warning" ? "⚠️" : "🔴";
    const statusLabel = info.status === "approved" ? "APROBADO" : info.status === "warning" ? "ADVERTENCIA" : "ALERTA SANITARIA";

    return text(
      `COFEPRIS — "${product}"\n` +
      `${emoji} ${statusLabel}\n\n` +
      `${info.note}\n\n` +
      `Referencia: NOM-051-SCFI/SSA1-2010 (Etiquetado frontal de alimentos y bebidas).`,
    );
  },
);

// ─── Tool 6: Find Healthy Options ─────────────────────────────────────────

server.tool(
  {
    name: "find-healthy-options",
    description:
      "Encuentra las opciones más saludables y económicas disponibles en tiendas de conveniencia cercanas según el objetivo de salud del usuario. Devuelve un resumen con productos recomendados, tienda sugerida y presupuesto estimado semanal.",
    schema: z.object({
      goal: z
        .enum(HEALTH_GOALS)
        .describe("Objetivo de salud: control_diabetes, perder_peso, mejorar_nutricion, mantener_peso."),
      location: z
        .string()
        .optional()
        .describe("Ciudad o zona, ej: 'Colonia Doctores, CDMX'."),
      budget: z
        .number()
        .optional()
        .describe("Presupuesto semanal disponible en pesos mexicanos (MXN)."),
    }),
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ goal, location, budget }) => {
    const cheapest = cheapestStore(SAMPLE_TICKET);
    const cheapestTotal = SAMPLE_TICKET.storeTotals.find((s) => s.store === cheapest)?.total ?? 0;
    const withinBudget = budget ? cheapestTotal <= budget : true;
    const goalName = goalLabel(goal);

    const recommendations: Record<typeof HEALTH_GOALS[number], string[]> = {
      control_diabetes: ["Nopal fresco", "Avena sin azúcar", "Frijoles negros", "Pechuga de pollo", "Verduras de hoja verde"],
      perder_peso: ["Pechuga de pollo", "Verduras al vapor", "Yogur natural sin azúcar", "Frutas con bajo índice glucémico"],
      mejorar_nutricion: ["Leguminosas (frijoles, lentejas)", "Cereales integrales", "Frutas y verduras de temporada"],
      mantener_peso: ["Avena", "Pollo o pescado", "Verduras", "Frutas", "Lácteos sin azúcar"],
    };

    const products = recommendations[goal].join(", ");

    return text(
      `Opciones saludables para ${goalName} — ${location ?? "México"}\n\n` +
      `Productos recomendados: ${products}.\n\n` +
      `🏬 Tienda más económica: ${cheapest} · $${cheapestTotal} MXN/semana.\n` +
      (budget
        ? withinBudget
          ? `✅ Dentro de tu presupuesto de $${budget} MXN (sobran $${budget - cheapestTotal}).`
          : `⚠️ El presupuesto de $${budget} MXN es ajustado. Considera priorizar proteínas y verduras.`
        : "") +
      `\n\n💡 Usa "show-ticket-comparison" para ver los precios detallados por tienda, ` +
      `"show-weekly-diet" para el plan completo y "show-shopping-cart" para armar el ticket de compra.`,
    );
  },
);

server.listen().then(() => {
  console.log("NutriMex MCP server running on port 3011");
});
