import { useEffect, useState, useCallback } from "react";
import Header from "./components/Header.jsx";
import MonthScroll from "./components/MonthScroll.jsx";
import InstallTip from "./components/InstallTip.jsx";
import Dial from "./components/Dial.jsx";
import Banner from "./components/Banner.jsx";
import SplitCard from "./components/SplitCard.jsx";
import TopCategories from "./components/TopCategories.jsx";
import PeriodTabs from "./components/PeriodTabs.jsx";
import HistoryList from "./components/HistoryList.jsx";
import BudgetsScreen from "./components/BudgetsScreen.jsx";
import BottomNav from "./components/BottomNav.jsx";
import AddSheet from "./components/AddSheet.jsx";
import {
  loadMonth,
  saveMonth,
  subscribeMonth,
  onAuthChange,
  getUserRole,
  signInWithEmail,
  signUpWithEmail,
} from "./lib/storage.js";
import { monthKey } from "./lib/format.js";

function defaultMonth() {
  return { overallBudget: 0, categoryBudgets: {}, expenses: [] };
}

function authErrorMessage(error) {
  const code = error?.code || "";
  if (code === "auth/operation-not-allowed") {
    return "Email/Password sign-in is disabled in Firebase. Enable it in Firebase Console -> Authentication -> Sign-in method.";
  }
  if (code === "auth/invalid-credential") {
    return "Incorrect email or password.";
  }
  if (code === "auth/user-not-found") {
    return "No account found for this email.";
  }
  if (code === "auth/wrong-password") {
    return "Incorrect password.";
  }
  if (code === "auth/email-already-in-use") {
    return "This email is already registered. Try signing in instead.";
  }
  if (code === "auth/weak-password") {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return error?.message || "Unable to sign in. Please try again.";
}

export default function App() {
  const [current, setCurrent] = useState(new Date(2026, 8, 1));
  const [screen, setScreen] = useState("home");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [data, setData] = useState(defaultMonth());
  const [syncState, setSyncState] = useState("ok");
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [period, setPeriod] = useState("month");
  const [yearExpenses, setYearExpenses] = useState([]);

  const key = monthKey(current);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load whenever the viewed month changes, and subscribe to live updates
  // so changes made on the other person's phone show up here automatically.
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    setSyncState("syncing");
    loadMonth(key).then((d) => {
      if (!cancelled) {
        setData(d);
        setSyncState("ok");
      }
    });
    const unsubscribe = subscribeMonth(key, (d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [key, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    Promise.all(
      Array.from({ length: 12 }, (_, month) => loadMonth(monthKey(new Date(current.getFullYear(), month, 1))))
    ).then((months) => {
      if (!cancelled) setYearExpenses(months.flatMap((month) => month.expenses || []));
    });
    return () => {
      cancelled = true;
    };
  }, [current.getFullYear(), currentUser]);

  const persist = useCallback(
    async (nextData) => {
      setData(nextData);
      setSyncState("syncing");
      const ok = await saveMonth(key, nextData);
      setSyncState(ok ? "ok" : "error");
    },
    [key]
  );

  function handleAddExpense({ id, amount, category, who, note, date }) {
    const targetKey = monthKey(new Date(date + "T00:00:00"));
    setSheetOpen(false);
    setEditingExpense(null);

    const apply = async () => {
      const nextExpense = {
        id: id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        amount,
        category,
        who,
        note,
        date,
      };

      setSyncState("syncing");

      if (!id) {
        const base = targetKey === key ? data : await loadMonth(targetKey);
        const next = { ...base, expenses: [...base.expenses, nextExpense] };
        const ok = await saveMonth(targetKey, next);
        setSyncState(ok ? "ok" : "error");
        const d = new Date(date + "T00:00:00");
        setCurrent(new Date(d.getFullYear(), d.getMonth(), 1));
        if (targetKey === key) setData(next);
        return;
      }

      const original = data.expenses.find((e) => e.id === id);
      const originalDate = original?.date || date;
      const sourceKey = monthKey(new Date(originalDate + "T00:00:00"));

      if (sourceKey === targetKey) {
        const base = targetKey === key ? data : await loadMonth(targetKey);
        const next = {
          ...base,
          expenses: base.expenses.map((e) => (e.id === id ? nextExpense : e)),
        };
        const ok = await saveMonth(targetKey, next);
        setSyncState(ok ? "ok" : "error");
        const d = new Date(date + "T00:00:00");
        setCurrent(new Date(d.getFullYear(), d.getMonth(), 1));
        if (targetKey === key) setData(next);
        return;
      }

      const sourceBase = sourceKey === key ? data : await loadMonth(sourceKey);
      const targetBase = targetKey === key ? data : await loadMonth(targetKey);
      const sourceNext = {
        ...sourceBase,
        expenses: sourceBase.expenses.filter((e) => e.id !== id),
      };
      const targetNext = {
        ...targetBase,
        expenses: [...targetBase.expenses.filter((e) => e.id !== id), nextExpense],
      };

      const okSource = await saveMonth(sourceKey, sourceNext);
      const okTarget = await saveMonth(targetKey, targetNext);
      setSyncState(okSource && okTarget ? "ok" : "error");

      const d = new Date(date + "T00:00:00");
      setCurrent(new Date(d.getFullYear(), d.getMonth(), 1));
      if (sourceKey === key) setData(sourceNext);
      if (targetKey === key) setData(targetNext);
    };
    apply();
  }

  function handleEdit(expense) {
    setEditingExpense(expense);
    setSheetOpen(true);
  }

  function handleDelete(id) {
    persist({ ...data, expenses: data.expenses.filter((e) => e.id !== id) });
  }

  function handleOverallChange(value) {
    persist({ ...data, overallBudget: value });
  }

  function handleLimitChange(cat, value) {
    persist({ ...data, categoryBudgets: { ...data.categoryBudgets, [cat]: value } });
  }

  const periodExpenses = (() => {
    if (period === "year") return yearExpenses;
    if (period === "month") return data.expenses;
    const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return data.expenses.filter((expense) => {
      const date = new Date(`${expense.date}T00:00:00`);
      return date >= start && date <= end;
    });
  })();
  const totalSpent = periodExpenses.reduce((s, e) => s + e.amount, 0);
  const today = new Date();
  const defaultDate = (monthKey(today) === key ? today : new Date(current.getFullYear(), current.getMonth(), 1))
    .toISOString()
    .slice(0, 10);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    setAuthBusy(true);
    setAuthError("");

    try {
      if (authMode === "signup") {
        if (!authName.trim()) {
          setAuthError("Please enter your name.");
          setAuthBusy(false);
          return;
        }
        await signUpWithEmail({ email: authEmail, password: authPassword, name: authName.trim() });
      } else {
        await signInWithEmail({ email: authEmail, password: authPassword });
      }
    } catch (error) {
      setAuthError(authErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  }

  if (!authReady) {
    return (
      <div className="phone">
        <div className="screen" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 360, background: "var(--surface)", border: "1px solid var(--stroke)", borderRadius: 18, padding: 24 }}>
            <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Common Pot</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Loading...</div>
            <div style={{ color: "var(--text-soft)", lineHeight: 1.5 }}>
              Preparing secure sign-in.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="phone">
        <div className="screen" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 360, background: "var(--surface)", border: "1px solid var(--stroke)", borderRadius: 18, padding: 24 }}>
            <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Common Pot</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>{authMode === "login" ? "Sign in" : "Create account"}</div>
            <div style={{ color: "var(--text-soft)", marginBottom: 18, lineHeight: 1.5 }}>
              Use your email to sign in. This is the most reliable method on iPhone standalone apps.
            </div>

            <form onSubmit={handleEmailSubmit} style={{ display: "grid", gap: 12 }}>
              {authMode === "signup" && (
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  style={{ borderRadius: 10, border: "1px solid var(--stroke)", background: "var(--surface-2)", color: "var(--text)", padding: "12px 14px" }}
                />
              )}
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                required
                style={{ borderRadius: 10, border: "1px solid var(--stroke)", background: "var(--surface-2)", color: "var(--text)", padding: "12px 14px" }}
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                required
                style={{ borderRadius: 10, border: "1px solid var(--stroke)", background: "var(--surface-2)", color: "var(--text)", padding: "12px 14px" }}
              />

              {authError && (
                <div style={{ color: "var(--warn)", fontSize: 12, lineHeight: 1.4 }}>{authError}</div>
              )}

              <button
                type="submit"
                disabled={authBusy}
                style={{ width: "100%", border: "none", borderRadius: 12, background: "var(--color-primary, #3F5141)", color: "var(--text)", padding: "12px 16px", fontWeight: 700, cursor: "pointer" }}
              >
                {authBusy ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              style={{ marginTop: 12, width: "100%", border: "1px solid var(--stroke)", borderRadius: 12, background: "transparent", color: "var(--text-soft)", padding: "10px 16px", cursor: "pointer" }}
            >
              {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone">
      <Header current={current} syncState={syncState} onOpenBudgets={() => setScreen("budgets")} />
      <MonthScroll current={current} onSelect={setCurrent} />

      {screen === "home" && (
        <section className="screen">
          <InstallTip />
          <PeriodTabs value={period} onChange={setPeriod} />
          <Dial totalSpent={totalSpent} overallBudget={period === "month" ? Number(data.overallBudget) || 0 : 0} />
          <Banner totalSpent={totalSpent} overallBudget={period === "month" ? Number(data.overallBudget) || 0 : 0} />
          <SplitCard expenses={periodExpenses} currentUser={currentUser} />
          <TopCategories expenses={periodExpenses} />
        </section>
      )}

      {screen === "history" && (
        <section className="screen">
          <HistoryList expenses={data.expenses} onDelete={handleDelete} onEdit={handleEdit} />
        </section>
      )}

      {screen === "budgets" && (
        <BudgetsScreen
          data={data}
          expenses={data.expenses}
          onOverallChange={handleOverallChange}
          onLimitChange={handleLimitChange}
        />
      )}

      <button
        className="fab"
        onClick={() => {
          setEditingExpense(null);
          setSheetOpen(true);
        }}
        aria-label="Add expense"
      >
        +
      </button>

      <BottomNav screen={screen} onChange={setScreen} />

      <AddSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleAddExpense}
        defaultDate={defaultDate}
        viewerRole={currentUser ? getUserRole(currentUser.uid) : "you"}
        initialExpense={editingExpense}
      />
    </div>
  );
}
