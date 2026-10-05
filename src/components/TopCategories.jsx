import { CATEGORIES, colorForCategory } from "../lib/categories";
import { fmt } from "../lib/format";

export default function TopCategories({ expenses }) {
  const totals = {};
  CATEGORIES.forEach((c) => (totals[c] = 0));
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
  const topCats = CATEGORIES.map((c) => ({ cat: c, amt: totals[c] }))
    .filter((e) => e.amt > 0)
    .sort((a, b) => b.amt - a.amt)
    .slice(0, 5);

  return (
    <>
      <div className="section-title-row">
        <h2 className="section-title">By category</h2>
      </div>
      {topCats.length === 0 ? (
        <div className="empty-note" style={{ padding: "14px 0" }}>
          No spending yet — tap + to add one.
        </div>
      ) : (
        <div className="list-card">
          {topCats.map((c) => (
            <div className="list-row" key={c.cat}>
              <div className="sq-icon" style={{ background: colorForCategory(c.cat) + "26" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: colorForCategory(c.cat) }}></div>
              </div>
              <div className="info">
                <div className="name">{c.cat}</div>
                <div className="category-progress">
                  <span style={{ width: `${total ? (c.amt / total) * 100 : 0}%`, background: colorForCategory(c.cat) }} />
                </div>
              </div>
              <div className="category-total">
                <div className="amt">{fmt(c.amt)}</div>
                <div className="category-percent">{total ? Math.round((c.amt / total) * 100) : 0}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
