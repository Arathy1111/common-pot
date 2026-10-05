import { fmt } from "../lib/format";

export default function Dial({ totalSpent, overallBudget }) {
  const ratio = overallBudget > 0 ? totalSpent / overallBudget : 0;
  const pct = Math.min(999, Math.round(ratio * 100));

  let pillClass = "";
  let pillText = "Set a budget to track";
  if (overallBudget > 0) {
    if (ratio > 1) {
      pillClass = "over";
      pillText = `Over by ${fmt(totalSpent - overallBudget)}`;
    } else if (ratio > 0.85) {
      pillClass = "near";
      pillText = `${fmt(overallBudget - totalSpent)} left`;
    } else {
      pillText = `${fmt(overallBudget - totalSpent)} left`;
    }
  }

  return (
    <div className="hero-row">
      <div className="hero-overview">
        <div className="overview-main">
          <div className="label">Spent this month</div>
          <div className="amount">{fmt(totalSpent)}</div>
          <div className="spend-battery" aria-label={`${pct}% of budget spent`}>
            <div className={`battery-shell ${ratio > 1 ? "over" : ""}`}>
              <div className="battery-fill" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <span>{overallBudget > 0 ? `${pct}% used` : "No budget set"}</span>
          </div>
          <div className={`hero-pill ${pillClass}`}>{pillText}</div>
        </div>
      </div>
    </div>
  );
}
