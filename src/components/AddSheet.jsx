import { useEffect, useState } from "react";
import { CATEGORIES } from "../lib/categories";

export default function AddSheet({
  open,
  onClose,
  onSubmit,
  defaultDate,
  viewerRole = "you",
  initialExpense = null,
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [who, setWho] = useState("you");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(defaultDate);

  const isViewerYou = viewerRole === "you";
  const submitWho = isViewerYou ? who : who === "you" ? "partner" : "you";
  const isEditing = Boolean(initialExpense?.id);

  useEffect(() => {
    if (!open) return;

    if (isEditing) {
      setAmount(String(initialExpense.amount ?? ""));
      setCategory(initialExpense.category || CATEGORIES[0]);
      setNote(initialExpense.note || "");
      setDate(initialExpense.date || defaultDate);

      const displayWho = isViewerYou
        ? initialExpense.who
        : initialExpense.who === "you"
        ? "partner"
        : "you";
      setWho(displayWho || "you");
      return;
    }

    setAmount("");
    setCategory(CATEGORIES[0]);
    setWho("you");
    setNote("");
    setDate(defaultDate);
  }, [open, isEditing, initialExpense, defaultDate, isViewerYou]);

  function handleSubmit(e) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0 || !date) return;
    onSubmit({ id: initialExpense?.id, amount: amt, category, who: submitWho, note: note.trim(), date });
    setAmount("");
    setNote("");
  }

  return (
    <>
      <div className={`sheet-backdrop ${open ? "show" : ""}`} onClick={onClose} style={{ display: open ? "block" : "none" }} />
      <div className={`sheet ${open ? "show" : ""}`}>
        <div className="sheet-handle"></div>
        <h2>{isEditing ? "Edit expense" : "Add an expense"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="amount-big">
            <span>₹</span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              required
              autoComplete="off"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Category</label>
            <div className="chip-grid">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={c === category ? "active" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>Who paid</label>
            <div className="who-toggle-sheet">
              <button type="button" data-who="you" className={who === "you" ? "active" : ""} onClick={() => setWho("you")}>
                {isViewerYou ? "Me" : "Partner"}
              </button>
              <button type="button" data-who="partner" className={who === "partner" ? "active" : ""} onClick={() => setWho("partner")}>
                {isViewerYou ? "Partner" : "Me"}
              </button>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="noteInput">Note (optional)</label>
            <input
              id="noteInput"
              type="text"
              placeholder="e.g. Swiggy order, electricity bill"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="dateInput">Date</label>
            <input id="dateInput" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <button type="submit" className="save-btn">
            {isEditing ? "Save changes" : "Add to budget"}
          </button>
        </form>
      </div>
    </>
  );
}
