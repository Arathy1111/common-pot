export function monthKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

export function monthLabel(d) {
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function monthChipLabel(d) {
  return d.toLocaleDateString("en-IN", { month: "short" }) + " " + String(d.getFullYear()).slice(2);
}

export function fmt(n) {
  return "₹" + Math.round(n || 0).toLocaleString("en-IN");
}
