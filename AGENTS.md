# AGENTS.md

## Project Overview

The Common Pot is a shared household budget tracker built with React 18, Vite, and Firebase. It is a responsive PWA intended for mobile screens and desktop web-app layouts.

The app supports:

- Email/password sign-up and sign-in through Firebase Auth.
- Shared monthly budgets and expenses stored in Firestore.
- Live updates between signed-in household members.
- Monthly, yearly, and weekly-style spending views.
- Expense history, category summaries, budget limits, and PWA installation.

## Development Commands

```bash
npm install          # install dependencies
npm run dev          # start the Vite development server
npm run build        # create the production build in dist/
npm run preview      # preview the production build locally
```

Run `npm run build` after changes that affect React code, CSS, Vite configuration, or PWA assets. The build may report a large JavaScript chunk warning; this is currently informational unless the bundle is being optimized.

No lint or test scripts are currently defined in `package.json`.
TODO: Add the exact verification commands here if linting or automated tests are introduced.

## Deployment Workflow

Firebase Hosting is configured in `firebase.json` to serve `dist/` with an SPA rewrite to `index.html`.

```bash
npm run build        # refresh dist/ before deployment
firebase deploy      # deploy dist/ with Firebase CLI after login/setup
```

Use `firebase init hosting` only for first-time hosting setup or reconfiguration; preserve `dist` as the public directory and keep the single-page app rewrite enabled.

## Repository Structure

- `src/App.jsx`: top-level state, authentication flow, month loading, expense mutations, and screen switching.
- `src/components/`: feature-level React components for the header, month picker, spending overview, history, budgets, categories, navigation, and expense sheet.
- `src/lib/storage.js`: Firebase Auth and Firestore persistence, subscriptions, and local role assignment.
- `src/lib/categories.js`: category names and category colors.
- `src/lib/format.js`: month keys, month labels, and INR currency formatting.
- `src/styles.css`: global design tokens, responsive layout, component styling, and desktop breakpoints.
- `public/icon.png`: transparent logo asset used by the header, favicon, and PWA manifest.
- `vite.config.js`: React and PWA configuration.
- `dist/`: generated production output; do not edit by hand.

## Application Flow

`App.jsx` owns the main data flow. Authentication is established first, then the selected month is loaded from Firestore and subscribed to for live updates. Expense and budget changes update local state and are persisted through `saveMonth`.

The main screen renders components in this order:

1. Installation tip
2. Period tabs
3. Spending overview (`Dial.jsx`)
4. Over-budget banner
5. You/partner spending split
6. Top categories

The bottom navigation switches between the home, history, and budgets screens. Keep screen-level state in `App.jsx`; keep presentational and feature-specific behavior inside the relevant component.

## Data Model

The default month object is:

```js
{
  overallBudget: 0,
  categoryBudgets: {},
  expenses: []
}
```

An expense contains an `id`, `amount`, `category`, `who`, `note`, and `date`. Month documents use `YYYY-MM` IDs. Preserve this shape when adding fields or changing persistence logic, and handle missing fields defensively for existing Firestore documents.

## Styling Guidelines

- Keep the dark evergreen page background on mobile and desktop.
- Use the logo-inspired sage, mint, gold, and coral palette defined in `:root` in `src/styles.css`.
- Keep body text and secondary labels readable against their surface; verify contrast after introducing bright gradients.
- Use the existing CSS variables instead of scattering new colors through components.
- Keep the spending overview visually focused on amount spent and percentage used. Avoid adding redundant lower panels or duplicate budget messaging.
- Preserve the mobile-first layout and test the desktop layout at the existing `860px` breakpoint.
- Keep cards reasonably compact and use hover states only as enhancement; all core interactions must work on touch screens.
- Use the existing fonts and border-radius language unless a design change explicitly requires otherwise.

## Firebase Notes

`src/lib/firebaseConfig.js` contains the active Firebase configuration and must not be replaced casually. `src/lib/storage.js` currently writes month documents under the `months` collection and subscribes with `onSnapshot`.

Firestore rules must require authenticated access before production use. Do not add credentials, service-account files, or private Firebase keys to the repository. When changing authentication or Firestore behavior, verify both signed-out and signed-in states.

## Change Workflow

1. Read the relevant component and nearby styles before editing.
2. Prefer existing patterns and CSS tokens over new abstractions.
3. Keep changes scoped to the requested behavior or visual area.
4. Preserve unrelated user changes in a dirty worktree.
5. Run `npm run build` before handing off completed work.
6. Mention any unverified Firebase or browser-specific behavior in the handoff.

## Avoid

- Editing generated files in `dist/` directly.
- Replacing the Firebase storage layer with local-only storage without an explicit request.
- Changing the Firestore document shape without considering existing data.
- Introducing a new visual palette in a single component that conflicts with the global tokens.
- Using destructive Git commands to clean up unrelated changes.
