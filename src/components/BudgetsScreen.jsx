import { CATEGORIES, colorForCategory } from "../lib/categories";
import { fmt } from "../lib/format";

export default function BudgetsScreen({ data, expenses, onOverallChange, onLimitChange }) {
  const totals = {};
  CATEGORIES.forEach((c) => (totals[c] = 0));
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  return (
    <section className="screen">
      <div className="overall-input-card">
        <label htmlFor="overallBudgetInput">Monthly household budget</label>
        <div className="input-row">
          <span>₹</span>
          <input
            id="overallBudgetInput"
            type="number"
            min="0"
            step="100"
            placeholder="0"
            value={data.overallBudget || ""}
            onChange={(e) => onOverallChange(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="section-title-row">
        <h2 className="section-title">By category</h2>
      </div>
      <div className="list-card">
        {CATEGORIES.map((cat) => {
          const spent = totals[cat] || 0;
          const limit = Number(data.categoryBudgets[cat]) || 0;
          const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : spent > 0 ? 100 : 0;
          const over = limit > 0 && spent > limit;
          const color = colorForCategory(cat);
          return (
            <div className="cat-budget-row" key={cat}>
              <div className="top">
                <div className="name-wrap">
                  <div style={{ width: 8, height: 8, borderRadius: 3, background: color }}></div>
                  <span className="name">{cat}</span>
                </div>
                <span className={`nums ${over ? "over" : ""}`}>
                  {fmt(spent)}
                  {limit ? ` / ${fmt(limit)}` : ""}
                </span>
              </div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${over ? "over" : ""}`}
                  style={{ width: `${pct}%`, background: over ? undefined : color }}
                ></div>
              </div>
              <div className="limit-row">
                <span>Limit ₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="0"
                  defaultValue={limit || ""}
                  onBlur={(e) => onLimitChange(cat, Number(e.target.value) || 0)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
