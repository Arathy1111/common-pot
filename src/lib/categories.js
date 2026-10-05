export const CATEGORIES = [
  "Groceries",
  "Rent/Housing",
  "Utilities",
  "Transport",
  "Dining Out",
  "Entertainment",
  "Shopping",
  "Health",
  "Travel",
  "Other",
];

export const CATEGORY_COLORS = [
  "#91A879", // Groceries — sage
  "#D9A441", // Rent/Housing — ochre
  "#688B63", // Utilities — green
  "#6F8870", // Transport — muted olive
  "#D9825B", // Dining Out — terracotta
  "#C98568", // Entertainment — warm clay
  "#A8B59F", // Shopping — soft sage
  "#C9A96A", // Health — warm sand
  "#7F9A78", // Travel — moss
  "#817C67", // Other — stone
];

export function colorForCategory(category) {
  const idx = CATEGORIES.indexOf(category);
  return CATEGORY_COLORS[idx === -1 ? 0 : idx];
}
