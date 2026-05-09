import type {
  MealDay, WeeklyDiet, TicketComparison, ShoppingCart, NutritionSummary,
} from "./types";

const meal = (
  id: string,
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  tags: string[],
  glycemicIndex: "bajo" | "medio" | "alto" = "bajo",
  description?: string,
) => ({ id, name, description, calories, macros: { protein, carbs, fat, fiber }, tags, glycemicIndex });

const DAYS_DATA: MealDay[] = [
  {
    day: "Lunes",
    breakfast: meal("l-b", "Avena con manzana y canela", 340, 12, 58, 8, 7, ["alto en fibra", "sin azúcar añadida"], "bajo", "Cocinada con agua, manzana troceada y canela natural"),
    lunch: meal("l-l", "Pollo a la plancha con nopal asado y frijoles negros", 450, 38, 32, 12, 9, ["alto en proteína", "bajo índice glucémico"], "bajo"),
    dinner: meal("l-d", "Caldo de verduras con tortillas de maíz nixtamalizado", 300, 8, 52, 5, 8, ["alto en fibra", "bajo en grasa"], "medio"),
    snacks: [meal("l-s", "Yogur natural con nueces", 190, 9, 14, 9, 1, ["probiótico", "grasas saludables"], "bajo")],
    totalCalories: 1280,
  },
  {
    day: "Martes",
    breakfast: meal("m-b", "Huevos revueltos con nopales y chile serrano", 280, 18, 12, 14, 3, ["alto en proteína", "bajo IG"], "bajo"),
    lunch: meal("m-l", "Tostadas de pollo con salsa verde y aguacate", 420, 32, 38, 15, 8, ["grasas saludables", "alto en fibra"], "medio"),
    dinner: meal("m-d", "Calabacitas con pollo y jitomate", 310, 26, 22, 10, 6, ["bajo en calorías", "rico en vitaminas"], "bajo"),
    snacks: [meal("m-s", "Manzana con mantequilla de almendra", 200, 5, 28, 9, 5, ["fibra soluble", "grasas saludables"], "bajo")],
    totalCalories: 1210,
  },
  {
    day: "Miércoles",
    breakfast: meal("mi-b", "Smoothie de espinaca, pepino y limón", 160, 5, 28, 3, 5, ["detox", "bajo en calorías"], "bajo"),
    lunch: meal("mi-l", "Arroz integral con pechuga y verduras asadas", 480, 40, 52, 10, 8, ["alto en fibra", "bajo IG"], "medio"),
    dinner: meal("mi-d", "Ensalada de nopal con jitomate y cebolla", 220, 6, 30, 6, 9, ["muy bajo en calorías", "alto en fibra"], "bajo"),
    snacks: [meal("mi-s", "Pepino con limón y chile piquín", 60, 2, 10, 0, 2, ["hidratante", "bajo en calorías"], "bajo")],
    totalCalories: 920,
  },
  {
    day: "Jueves",
    breakfast: meal("j-b", "Avena integral con plátano y chía", 380, 13, 65, 9, 10, ["alto en fibra", "energía sostenida"], "bajo"),
    lunch: meal("j-l", "Fajitas de pollo con pimiento y cebolla morada", 440, 36, 30, 14, 7, ["alto en proteína", "antioxidantes"], "bajo"),
    dinner: meal("j-d", "Sopa de lenteja con chile pasilla", 340, 18, 48, 6, 12, ["alto en proteína vegetal", "hierro"], "bajo"),
    snacks: [meal("j-s", "Puño de nueces mixtas", 180, 5, 8, 16, 2, ["omega-3", "grasas saludables"], "bajo")],
    totalCalories: 1340,
  },
  {
    day: "Viernes",
    breakfast: meal("v-b", "Hotcakes de avena con miel de agave", 320, 10, 54, 8, 5, ["fibra", "energía"] , "medio"),
    lunch: meal("v-l", "Tacos de pollo con salsa de chile de árbol y nopal", 480, 35, 46, 14, 9, ["tradicional", "alto en proteína"], "medio"),
    dinner: meal("v-d", "Caldo tlalpeño con garbanzo", 310, 16, 38, 7, 10, ["alto en fibra", "bajo en grasa"], "bajo"),
    snacks: [meal("v-s", "Jícama con limón y chamoy sin azúcar", 90, 2, 18, 0, 7, ["alto en fibra", "bajo en calorías"], "bajo")],
    totalCalories: 1200,
  },
  {
    day: "Sábado",
    breakfast: meal("s-b", "Chilaquiles verdes con pollo (sin crema)", 400, 22, 48, 12, 6, ["tradicional", "sin crema"], "medio"),
    lunch: meal("s-l", "Pozole verde light con pechuga", 390, 34, 36, 8, 8, ["bajo en grasa", "proteína magra"], "bajo"),
    dinner: meal("s-d", "Ensalada de betabel, espinaca y queso panela", 280, 12, 32, 10, 7, ["antioxidantes", "calcio"], "bajo"),
    snacks: [meal("s-s", "Pera con yogur natural", 170, 6, 32, 3, 4, ["fibra soluble", "probiótico"], "bajo")],
    totalCalories: 1240,
  },
  {
    day: "Domingo",
    breakfast: meal("d-b", "Omelet de claras con espinaca y champiñones", 220, 20, 8, 10, 3, ["alto en proteína", "bajo en calorías"], "bajo"),
    lunch: meal("d-l", "Pechuga en salsa de tomate con verduras al vapor", 430, 40, 28, 12, 8, ["alto en proteína", "vitaminas"], "bajo"),
    dinner: meal("d-d", "Caldo de pollo con zanahoria, chayote y cilantro", 260, 20, 24, 6, 5, ["reconfortante", "bajo en grasa"], "bajo"),
    snacks: [meal("d-s", "Nueces de la India con fresas", 200, 5, 22, 11, 3, ["vitamina C", "grasas saludables"], "bajo")],
    totalCalories: 1110,
  },
];

export const SAMPLE_DIET: WeeklyDiet = {
  days: DAYS_DATA,
  goal: "control_diabetes",
  avgCalories: Math.round(DAYS_DATA.reduce((s, d) => s + d.totalCalories, 0) / 7),
  avgMacros: {
    protein: 24,
    carbs: 36,
    fat: 11,
    fiber: 6,
  },
  location: "Ciudad de México",
};

export const SAMPLE_TICKET: TicketComparison = {
  stores: ["OXXO", "7-Eleven", "Walmart Express", "Soriana"],
  products: [
    {
      qty: 1,
      product: {
        id: "p1", name: "Avena Quaker 500g", brand: "Quaker", category: "Cereales",
        calories: 380, macros: { protein: 14, carbs: 67, fat: 7, fiber: 10 },
        cofeprisStatus: "approved",
      },
      prices: [
        { store: "OXXO", price: 29, unit: "500g", available: true },
        { store: "7-Eleven", price: 31, unit: "500g", available: true },
        { store: "Walmart Express", price: 24, unit: "500g", available: true },
        { store: "Soriana", price: 22, unit: "500g", available: true },
      ],
    },
    {
      qty: 1,
      product: {
        id: "p2", name: "Pechuga de pollo 500g", brand: "Pilgrim's", category: "Proteínas",
        calories: 165, macros: { protein: 31, carbs: 0, fat: 4, fiber: 0 },
        cofeprisStatus: "approved",
      },
      prices: [
        { store: "OXXO", price: 78, unit: "500g", available: true },
        { store: "7-Eleven", price: 82, unit: "500g", available: false },
        { store: "Walmart Express", price: 65, unit: "500g", available: true },
        { store: "Soriana", price: 62, unit: "500g", available: true },
      ],
    },
    {
      qty: 1,
      product: {
        id: "p3", name: "Frijoles negros 500g", brand: "La Costena", category: "Leguminosas",
        calories: 132, macros: { protein: 9, carbs: 24, fat: 1, fiber: 8 },
        cofeprisStatus: "approved",
      },
      prices: [
        { store: "OXXO", price: 24, unit: "500g", available: true },
        { store: "7-Eleven", price: 26, unit: "500g", available: true },
        { store: "Walmart Express", price: 19, unit: "500g", available: true },
        { store: "Soriana", price: 18, unit: "500g", available: true },
      ],
    },
    {
      qty: 1,
      product: {
        id: "p4", name: "Nopal fresco 300g", category: "Verduras",
        calories: 22, macros: { protein: 2, carbs: 5, fat: 0, fiber: 4 },
        cofeprisStatus: "approved",
      },
      prices: [
        { store: "OXXO", price: 18, unit: "300g", available: true },
        { store: "7-Eleven", price: 19, unit: "300g", available: false },
        { store: "Walmart Express", price: 14, unit: "300g", available: true },
        { store: "Soriana", price: 12, unit: "300g", available: true },
      ],
    },
    {
      qty: 2,
      product: {
        id: "p5", name: "Yogur natural sin azúcar 1L", brand: "Lala", category: "Lácteos",
        calories: 60, macros: { protein: 5, carbs: 5, fat: 2, fiber: 0 },
        cofeprisStatus: "approved",
      },
      prices: [
        { store: "OXXO", price: 38, unit: "1L", available: true },
        { store: "7-Eleven", price: 41, unit: "1L", available: true },
        { store: "Walmart Express", price: 32, unit: "1L", available: true },
        { store: "Soriana", price: 30, unit: "1L", available: true },
      ],
    },
    {
      qty: 1,
      product: {
        id: "p6", name: "Manzana roja (bolsa 4 piezas)", category: "Frutas",
        calories: 52, macros: { protein: 0, carbs: 14, fat: 0, fiber: 2 },
        cofeprisStatus: "approved",
      },
      prices: [
        { store: "OXXO", price: 32, unit: "4 pzas", available: true },
        { store: "7-Eleven", price: 35, unit: "4 pzas", available: true },
        { store: "Walmart Express", price: 26, unit: "4 pzas", available: true },
        { store: "Soriana", price: 24, unit: "4 pzas", available: true },
      ],
    },
    {
      qty: 1,
      product: {
        id: "p7", name: "Tortillas de maíz nixtamalizado 1kg", brand: "Maseca", category: "Cereales",
        calories: 361, macros: { protein: 7, carbs: 76, fat: 4, fiber: 6 },
        cofeprisStatus: "approved",
        cofeprisNote: "Producto de maíz nixtamalizado. Sin sellos de advertencia.",
      },
      prices: [
        { store: "OXXO", price: 24, unit: "1kg", available: true },
        { store: "7-Eleven", price: 26, unit: "1kg", available: true },
        { store: "Walmart Express", price: 20, unit: "1kg", available: true },
        { store: "Soriana", price: 19, unit: "1kg", available: true },
      ],
    },
  ],
  storeTotals: [
    { store: "OXXO", total: 281 },
    { store: "7-Eleven", total: 298 },
    { store: "Walmart Express", total: 230 },
    { store: "Soriana", total: 217 },
  ],
  recommendedStore: "Soriana",
  location: "Ciudad de México",
};

export const SAMPLE_CART: ShoppingCart = {
  store: "Soriana",
  week: "12–18 Mayo 2025",
  subtotal: 217,
  savingsVsMax: 81,
  items: SAMPLE_TICKET.products.map((pc) => {
    const sorPrice = pc.prices.find((p) => p.store === "Soriana")!;
    return {
      product: pc.product,
      qty: pc.qty,
      price: sorPrice.price,
      store: "Soriana" as const,
    };
  }),
};

export const SAMPLE_SUMMARY: NutritionSummary = {
  weeklyCalories: DAYS_DATA.map((d) => ({ day: d.day.slice(0, 3), calories: d.totalCalories })),
  avgMacros: SAMPLE_DIET.avgMacros,
  avgSodium: 1420,
  avgSugar: 22,
  healthScore: 82,
  goal: "control_diabetes",
  targetCalories: 1300,
};

export const COFEPRIS_DB: Record<string, { status: "approved" | "warning" | "alert"; note: string }> = {
  "coca-cola": { status: "warning", note: "EXCESO AZÚCARES · EXCESO CALORÍAS. Contiene 65g de azúcar por envase 600ml. Evitar en diabetes." },
  "pepsi": { status: "warning", note: "EXCESO AZÚCARES · EXCESO CALORÍAS. Alto contenido en azúcares simples." },
  "sabritas": { status: "warning", note: "EXCESO SODIO · EXCESO GRASAS SATURADAS. Consumo frecuente no recomendable." },
  "cheetos": { status: "warning", note: "EXCESO SODIO · EXCESO GRASAS SATURADAS · EXCESO CALORÍAS." },
  "gansito": { status: "alert", note: "EXCESO AZÚCARES · EXCESO GRASAS SATURADAS · EXCESO CALORÍAS. Producto ultra-procesado. No recomendable para personas con diabetes u obesidad." },
  "submarino": { status: "alert", note: "EXCESO AZÚCARES · EXCESO GRASAS SATURADAS. Producto ultra-procesado." },
  "maruchan": { status: "warning", note: "EXCESO SODIO · EXCESO GRASAS SATURADAS. Alto en sodio, bajo valor nutricional." },
  "avena": { status: "approved", note: "Sin sellos de advertencia. Rica en fibra soluble (betaglucano). Recomendada para control glucémico." },
  "nopal": { status: "approved", note: "Sin sellos de advertencia. Excelente para control de diabetes por su alto contenido en fibra y pectinas." },
  "frijoles": { status: "approved", note: "Sin sellos de advertencia. Alto en fibra y proteína vegetal. Bajo índice glucémico." },
  "yogur natural": { status: "approved", note: "Sin sellos de advertencia. Verificar que no contenga azúcares añadidos." },
  "pollo": { status: "approved", note: "Sin sellos de advertencia. Proteína magra recomendada." },
};
