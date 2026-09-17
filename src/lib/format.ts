const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Node and the browser can pick different ICU space characters (regular vs
// non-breaking) between "R$" and the number, which mismatches during
// hydration. Normalize to a plain space so SSR and client output match.
export function formatCurrency(value: number) {
  return currencyFormatter.format(value).replace(/[  ]/g, " ");
}
