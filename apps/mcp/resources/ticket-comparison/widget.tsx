import { useWidget, type WidgetMetadata } from "mcp-use/react";
import React, { useState } from "react";
import { z } from "zod";
import { ticketComparisonSchema, type TicketComparison, type Store } from "../../src/lib/nutrition/types";
import { cofeprisEmoji, storeEmoji, cheapestStore, savingsAmount } from "../../src/lib/nutrition/derive";
import { SAMPLE_TICKET } from "../../src/lib/nutrition/sample";

const propsSchema = z.object({
  ticket: ticketComparisonSchema.optional().describe("Comparativa de precios. Si se omite, usa datos de muestra."),
});

export type TicketComparisonWidgetProps = z.infer<typeof propsSchema>;

export const widgetMetadata: WidgetMetadata = {
  description: "Compara el costo de los productos de la dieta en OXXO, 7-Eleven, Walmart Express y Soriana con la mejor opción resaltada.",
  props: propsSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Consultando precios…",
    invoked: "Precios comparados",
  },
};

function PriceCell({
  price,
  available,
  isLowest,
  isHighest,
}: {
  price: number;
  available: boolean;
  isLowest: boolean;
  isHighest: boolean;
}) {
  if (!available) {
    return (
      <td className="px-3 py-2.5 text-center text-[11px] text-neutral-400">
        No disponible
      </td>
    );
  }
  return (
    <td
      className={`px-3 py-2.5 text-center text-sm font-semibold tabular-nums transition-colors ${
        isLowest
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
          : isHighest
          ? "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
          : "text-neutral-700 dark:text-neutral-300"
      }`}
    >
      ${price}
      {isLowest && <span className="ml-1 text-[9px]">▼</span>}
    </td>
  );
}

const TicketComparisonWidget: React.FC = () => {
  const { props } = useWidget<TicketComparisonWidgetProps>();
  const ticket: TicketComparison = props?.ticket ?? SAMPLE_TICKET;
  const [selectedStore, setSelectedStore] = useState<Store | null>(ticket.recommendedStore ?? null);

  const cheapest = cheapestStore(ticket);
  const savings = savingsAmount(ticket);
  const maxTotal = Math.max(...ticket.storeTotals.map((s) => s.total));

  return (
    <div className="w-full p-4 text-neutral-900 dark:text-neutral-50">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        {/* Header */}
        <div className="border-b border-neutral-100 px-5 pt-5 pb-4 dark:border-neutral-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧾</span>
                <h1 className="text-xl font-semibold">Comparador de Ticket</h1>
              </div>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {ticket.products.length} productos · {ticket.location ?? "México"}
              </p>
            </div>
            {savings > 0 && (
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right dark:bg-emerald-900/20">
                <div className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  Ahorra ${savings}
                </div>
                <div className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">
                  vs. la tienda más cara
                </div>
              </div>
            )}
          </div>

          {/* Store totals summary */}
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            {ticket.storeTotals.map((st) => (
              <button
                key={st.store}
                onClick={() => setSelectedStore(st.store)}
                className={`rounded-xl border p-2.5 text-left transition-all ${
                  selectedStore === st.store
                    ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20"
                    : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {storeEmoji(st.store)} {st.store}
                </div>
                <div
                  className={`mt-1 text-lg font-bold tabular-nums ${
                    st.store === cheapest
                      ? "text-emerald-600 dark:text-emerald-400"
                      : st.total === maxTotal
                      ? "text-red-500 dark:text-red-400"
                      : "text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  ${st.total}
                </div>
                {st.store === cheapest && (
                  <div className="mt-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    Mejor precio ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wide text-neutral-500 dark:bg-neutral-900/40 dark:text-neutral-400">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Producto</th>
                {ticket.stores.map((store) => (
                  <th key={store} className="px-3 py-2.5 text-center font-semibold">
                    {storeEmoji(store)} {store}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {ticket.products.map((pc) => {
                const availablePrices = pc.prices.filter((p) => p.available).map((p) => p.price);
                const minPrice = availablePrices.length ? Math.min(...availablePrices) : Infinity;
                const maxPrice = availablePrices.length ? Math.max(...availablePrices) : -Infinity;
                return (
                  <tr key={pc.product.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{cofeprisEmoji(pc.product.cofeprisStatus)}</span>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {pc.product.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {pc.product.category}
                            {pc.qty > 1 && ` · x${pc.qty}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    {ticket.stores.map((store) => {
                      const priceData = pc.prices.find((p) => p.store === store);
                      if (!priceData) return <td key={store} className="px-3 py-2.5 text-center text-neutral-400">—</td>;
                      return (
                        <PriceCell
                          key={store}
                          price={priceData.price}
                          available={priceData.available}
                          isLowest={priceData.available && priceData.price === minPrice && minPrice !== maxPrice}
                          isHighest={priceData.available && priceData.price === maxPrice && minPrice !== maxPrice}
                        />
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-neutral-200 dark:border-neutral-700">
              <tr className="bg-neutral-50 dark:bg-neutral-900/40 font-bold">
                <td className="px-3 py-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Total semanal
                </td>
                {ticket.storeTotals.map((st) => (
                  <td
                    key={st.store}
                    className={`px-3 py-3 text-center text-base font-bold tabular-nums ${
                      st.store === cheapest
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    ${st.total}
                    {st.store === cheapest && <div className="text-[10px] font-medium">Mejor ✓</div>}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Legend */}
        <div className="border-t border-neutral-100 px-5 py-3 dark:border-neutral-800">
          <div className="flex flex-wrap gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1"><span className="text-emerald-500">▼</span> Más barato</span>
            <span className="flex items-center gap-1"><span>✅</span> COFEPRIS aprobado</span>
            <span className="flex items-center gap-1"><span>⚠️</span> Advertencia</span>
            <span className="flex items-center gap-1"><span>🔴</span> Alerta sanitaria</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketComparisonWidget;
