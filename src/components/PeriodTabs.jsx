const PERIODS = [
  ["week", "This Week"],
  ["month", "This Month"],
  ["year", "This Year"],
];

export default function PeriodTabs({ value, onChange }) {
  return (
    <div className="period-tabs" role="tablist" aria-label="Spending period">
      {PERIODS.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          className={value === id ? "active" : ""}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
