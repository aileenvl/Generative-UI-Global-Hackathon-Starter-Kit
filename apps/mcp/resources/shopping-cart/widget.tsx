import { useWidget, type WidgetMetadata } from "mcp-use/react";
import React from "react";
import { z } from "zod";
import { shoppingCartSchema, type ShoppingCart } from "../../src/lib/nutrition/types";
import { cofeprisClass, cofeprisLabel, storeEmoji } from "../../src/lib/nutrition/derive";
import { SAMPLE_CART } from "../../src/lib/nutrition/sample";

const propsSchema = z.object({
  cart: shoppingCartSchema.optional().describe("Carrito de compras. Si se omite, usa datos de muestra."),
});

export type ShoppingCartWidgetProps = z.infer<typeof propsSchema>;

export const widgetMetadata: WidgetMetadata = {
  description: "Muestra el ticket de compra optimizado con productos, cantidades, precios y estado COFEPRIS de cada artículo.",
  props: propsSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Armando ticket…",
    invoked: "Ticket listo",
  },
};

const ShoppingCartWidget: React.FC = () => {
  const { props } = useWidget<ShoppingCartWidgetProps>();
  const cart: ShoppingCart = props?.cart ?? SAMPLE_CART;

  const alertItems = cart.items.filter((i) => i.product.cofeprisStatus === "alert");
  const warningItems = cart.items.filter((i) => i.product.cofeprisStatus === "warning");
  const hasIssues = alertItems.length > 0 || warningItems.length > 0;

  return (
    <div className="w-full p-4 text-neutral-900 dark:text-neutral-50">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        {/* Header */}
        <div className="border-b border-neutral-100 px-5 pt-5 pb-4 dark:border-neutral-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{storeEmoji(cart.store)}</span>
                <div>
                  <h1 className="text-xl font-semibold">Ticket de Compra</h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {cart.store}
                    {cart.week && ` · Semana del ${cart.week}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                ${cart.subtotal}
              </div>
              <div className="text-[11px] text-neutral-500">Total MXN</div>
              {cart.savingsVsMax && cart.savingsVsMax > 0 && (
                <div className="mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  Ahorraste ${cart.savingsVsMax}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COFEPRIS warnings banner */}
        {hasIssues && (
          <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10">
            <div className="flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Aviso COFEPRIS: </span>
                {alertItems.length > 0 && (
                  <span>{alertItems.length} producto(s) con alerta sanitaria. </span>
                )}
                {warningItems.length > 0 && (
                  <span>{warningItems.length} producto(s) con advertencia de etiquetado.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {cart.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {item.product.name}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {item.product.category}
                    {item.qty > 1 && ` · ${item.qty} uds`}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${cofeprisClass(item.product.cofeprisStatus)}`}
                  >
                    {cofeprisLabel(item.product.cofeprisStatus)}
                  </span>
                </div>
                {item.product.cofeprisNote && item.product.cofeprisStatus !== "approved" && (
                  <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-400">
                    {item.product.cofeprisNote}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                  ${item.qty > 1 ? item.price * item.qty : item.price}
                </div>
                {item.qty > 1 && (
                  <div className="text-[10px] text-neutral-500">${item.price} c/u</div>
                )}
                <div className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {item.product.calories} kcal
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer totals */}
        <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-700">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>{cart.items.reduce((s, i) => s + i.qty, 0)} productos</span>
              <span className="tabular-nums">${cart.subtotal}</span>
            </div>
            {cart.savingsVsMax && cart.savingsVsMax > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Ahorro vs. tienda más cara</span>
                <span className="tabular-nums font-medium">−${cart.savingsVsMax}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-100 pt-2 font-bold dark:border-neutral-800">
              <span className="text-neutral-900 dark:text-neutral-100">Total</span>
              <span className="text-lg tabular-nums text-emerald-600 dark:text-emerald-400">
                ${cart.subtotal} MXN
              </span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-neutral-400 dark:text-neutral-500">
            Precios orientativos. Verificar disponibilidad en tienda. Información COFEPRIS según
            NOM-051-SCFI/SSA1-2010.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartWidget;
