import { fmt } from "../lib/format";
import { useEffect, useState } from "react";
import { getUserRole } from "../lib/storage";

export default function SplitCard({ expenses, currentUser }) {
  const [userRole, setUserRole] = useState("you"); // "you" or "partner"

  // Determine this user's role based on who logged in first
  useEffect(() => {
    if (!currentUser?.uid) return;

    const role = getUserRole(currentUser.uid);
    setUserRole(role);
  }, [currentUser?.uid]);

  const youTotal = expenses.filter((e) => e.who === "you").reduce((s, e) => s + e.amount, 0);
  const partnerTotal = expenses.filter((e) => e.who === "partner").reduce((s, e) => s + e.amount, 0);
  const max = Math.max(youTotal, partnerTotal, 1);

  // Determine labels and colors based on the current viewer's role.
  const isCurrentUserYou = userRole === "you";
  const mySide = isCurrentUserYou ? "you" : "partner";
  const theirSide = isCurrentUserYou ? "partner" : "you";
  const currentUserLabel = "You spent";
  const otherUserLabel = "Partner spent";
  const currentUserAmount = expenses.filter((e) => e.who === mySide).reduce((s, e) => s + e.amount, 0);
  const otherUserAmount = expenses.filter((e) => e.who === theirSide).reduce((s, e) => s + e.amount, 0);
  const currentUserClass = isCurrentUserYou ? "you" : "partner";
  const otherUserClass = isCurrentUserYou ? "partner" : "you";

  return (
    <div className="split-card">
      <div className={`split-item ${currentUserClass}`}>
        <div className="icon-chip">🧾</div>
        <div className="who-label">{currentUserLabel}</div>
        <div className="amt">{fmt(currentUserAmount)}</div>
        <div className="underline">
          <div className="fill" style={{ width: `${(currentUserAmount / max) * 100}%` }}></div>
        </div>
      </div>
      <div className={`split-item ${otherUserClass}`}>
        <div className="icon-chip">🧾</div>
        <div className="who-label">{otherUserLabel}</div>
        <div className="amt">{fmt(otherUserAmount)}</div>
        <div className="underline">
          <div className="fill" style={{ width: `${(otherUserAmount / max) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
}
