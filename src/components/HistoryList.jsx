import { colorForCategory } from "../lib/categories";
import { fmt } from "../lib/format";

export default function HistoryList({ expenses, onDelete, onEdit }) {
  if (expenses.length === 0) {
    return (
      <>
        <div className="section-title-row" style={{ marginTop: 16 }}>
          <h2 className="section-title">All entries</h2>
        </div>
        <div className="empty-note">No entries this month yet.</div>
      </>
    );
  }

  const byDate = {};
  [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((e) => {
      if (!byDate[e.date]) byDate[e.date] = [];
      byDate[e.date].push(e);
    });

  return (
    <>
      <div className="section-title-row" style={{ marginTop: 16 }}>
        <h2 className="section-title">All entries</h2>
      </div>
      {Object.keys(byDate).map((date) => {
        const d = new Date(date + "T00:00:00");
        const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
        return (
          <div className="day-group" key={date}>
            <div className="day-label">{label}</div>
            <div className="list-card">
              {byDate[date].map((e) => (
                <div className="list-row" key={e.id} onClick={() => {}}>
                  <div className="sq-icon" style={{ background: colorForCategory(e.category) + "26", color: colorForCategory(e.category) }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: colorForCategory(e.category) }}></div>
                  </div>
                  <div className="info">
                    <div className="name">{e.category}</div>
                    <div className="sub">{e.note || (e.who === "you" ? "You" : "Partner")}</div>
                  </div>
                  <div className={`amt ${e.who}`}>{fmt(e.amount)}</div>
                  <button
                    onClick={() => onEdit(e)}
                    aria-label="Edit"
                    style={{ background: "none", border: "none", color: "var(--text-soft)", fontSize: "0.9rem", cursor: "pointer", padding: "2px 6px" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(e.id)}
                    aria-label="Delete"
                    style={{ background: "none", border: "none", color: "var(--text-soft)", fontSize: "1rem", cursor: "pointer", padding: "2px 0 2px 4px" }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
