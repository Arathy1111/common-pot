import { useEffect, useState } from "react";

export default function InstallTip() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    const dismissed = localStorage.getItem("installTipDismissed") === "1";
    if (isStandalone || dismissed) return;

    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/.test(ua)) {
      setMessage('Tap the Share icon in your browser bar, then "Add to Home Screen." Do this from this same link on your partner\'s phone too, so you both stay synced.');
    } else if (/Android/.test(ua)) {
      setMessage('Tap the ⋮ menu in your browser, then "Add to Home screen." Do this from this same link on your partner\'s phone too, so you both stay synced.');
    } else {
      setMessage("Open this app on your phone's browser to add it to your home screen.");
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    localStorage.setItem("installTipDismissed", "1");
  }

  return (
    <div className="install-tip">
      <div className="icon-wrap">📲</div>
      <div className="body">
        <div className="title">Add this to your home screen</div>
        <div className="desc">{message}</div>
      </div>
      <button className="close" onClick={dismiss} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}
