import { monthLabel } from "../lib/format";

export default function Header({ current, syncState, onOpenBudgets }) {
  const statusText =
    syncState === "syncing" ? "Syncing…" : syncState === "error" ? "Local only" : "Synced";
  const statusClass = syncState === "syncing" ? "syncing" : syncState === "error" ? "error" : "";

  return (
    <div className="app-header">
      <div className="app-header-left">
        <div className="brand-badge">₹</div>
        <div className="title-block">
          <h1>Common pot</h1>
          <div className="sub">{monthLabel(current)}</div>
        </div>
      </div>
      <div className="header-actions">
        <div className={`sync-status ${statusClass}`}>● {statusText}</div>
        <button className="header-filter" type="button" onClick={onOpenBudgets} aria-label="Open budgets" title="Open budgets">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16" /><path d="M4 17h16" /><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="2" fill="currentColor" stroke="none" />
          </svg>
        </button>
      </div>
    </div>
  );
}
