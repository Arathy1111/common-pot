import { fmt } from "../lib/format";

export default function Banner({ totalSpent, overallBudget }) {
  if (!(overallBudget > 0 && totalSpent > overallBudget)) return null;
  return (
    <div className="banner">
      <span className="dot"></span>
      <span>Over budget by {fmt(totalSpent - overallBudget)} this month.</span>
    </div>
  );
}
