import { monthKey, monthChipLabel } from "../lib/format";

const ANCHOR = new Date(2026, 8, 1); // September 2026 — change to your own reference month if you like

export default function MonthScroll({ current, onSelect }) {
  const months = [];
  for (let i = -3; i <= 3; i++) {
    months.push(new Date(ANCHOR.getFullYear(), ANCHOR.getMonth() + i, 1));
  }

  return (
    <div className="month-scroll">
      {months.map((d) => (
        <button
          key={monthKey(d)}
          className={`month-chip ${monthKey(d) === monthKey(current) ? "active" : ""}`}
          onClick={() => onSelect(d)}
        >
          {monthChipLabel(d)}
        </button>
      ))}
    </div>
  );
}
