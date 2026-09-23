# The Common Pot

A shared household budget tracker — built with React + Vite.

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

To build a static version you can deploy anywhere:

```bash
npm run build
```

This outputs a `dist/` folder you can host on any static host (Vercel, Netlify, Firebase Hosting, GitHub Pages, etc).

## Project structure

```
src/
  App.jsx                  — top-level state and screen switching
  components/
    Header.jsx              — title + sync status
    MonthScroll.jsx          — month picker chips
    InstallTip.jsx            — "Add to Home Screen" hint
    Dial.jsx                   — circular budget-used gauge
    Banner.jsx                  — over-budget warning
    SplitCard.jsx                — you vs. husband spend split
    TopCategories.jsx             — top category pills
    HistoryList.jsx                — all entries, grouped by day
    BudgetsScreen.jsx               — overall + per-category limits
    BottomNav.jsx                    — tab bar
    AddSheet.jsx                      — bottom sheet to log an expense
  lib/
    categories.js             — the list of categories + their colors
    format.js                  — date/currency helpers
    storage.js                  — where data is saved (see below)
```

Because each screen is its own component, adding new ones is just:
1. Create `src/components/YourThing.jsx`
2. Import it in `App.jsx`
3. Render it inside whichever screen block you want it in (or add a new tab in `BottomNav.jsx`)

## Cross-device sync (Firebase) — already set up

This project is wired to your Firebase project **the-common-pot**, so it
syncs in real time between your phone and your husband's: add an expense
on one, it shows up on the other within a second or two, no reload needed.

`src/lib/storage.js` is the Firebase-backed version, and
`src/lib/firebaseConfig.js` already has your project's config filled in.

**One important step before you rely on this:** your Firestore database is
currently in "test mode," which means anyone with your project ID can read
or write to it — fine for getting it working, not fine long-term. Lock it
down:

1. Go to the [Firebase console](https://console.firebase.google.com) →
   your project → Firestore Database → **Rules** tab.
2. Replace the rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /months/{monthId} {
         allow read, write: if true;
       }
     }
   }
   ```
   This scopes access to just the `months` collection this app uses (still
   open to anyone who has your config, but no longer anyone who guesses
   *any* Firestore path). If you want to fully lock it to just you two,
   let me know — that needs adding Firebase Authentication, which I can
   help wire in.

If you ever want to go back to the simple local-only version (no
Firebase), the original is saved as reference in git history, or ask me
and I'll regenerate it.

## Deploying so it works outside Claude entirely

Right now this runs locally on your laptop (`npm run dev`). To get it onto
both your phones as a real installable app with a public URL:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # choose "the-common-pot" as the project,
                           # set public directory to "dist",
                           # configure as single-page app: Yes
npm run build
firebase deploy
```

This gives you a URL like `https://the-common-pot.web.app`. Because the
app is set up as a real PWA (`vite-plugin-pwa`), opening that URL in
Chrome on Android shows an actual **Install** prompt (not just a bookmark
shortcut), and it works offline for the app shell even with a flaky
connection — live budget data still needs a connection to sync through
Firestore. On iPhone, Safari doesn't support install prompts, so use
Share → **Add to Home Screen**, which now also launches full-screen with
no browser bars thanks to the manifest.

## Customizing

- **Categories**: edit the `CATEGORIES` and `CATEGORY_COLORS` arrays in
  `src/lib/categories.js`.
- **Names**: "You" / "Husband" are currently hardcoded labels in
  `SplitCard.jsx` and `AddSheet.jsx` — search for `"partner"` if you want to
  make them editable names instead.
- **Currency**: `fmt()` in `src/lib/format.js` formats as ₹ (INR) — change
  the symbol and `toLocaleString` locale there for a different currency.
- **Colors/fonts**: all design tokens are CSS variables at the top of
  `src/styles.css`.
# common-pot
