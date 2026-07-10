# AttendLy

A small attendance and leave tracker. Employees sign in, mark daily attendance, and
request leave. Managers sign in, approve or reject leave requests, and see a dashboard
of attendance and pending requests across the team — filterable by month and employee.

Built with Angular (standalone components, strict TypeScript) and Firebase
(Firestore + Auth), using AngularFire.

## Demo login

> Fill this in after you create your two test accounts (see "Seed demo accounts" below),
> then keep it here for the reviewer.

- Employee: `rohini123@gmail.com` / `Rohini@123`
- Manager: `gowthami123@gmail.com` / `Gowthami@123`

## How to use the app

1. Open the live demo URL.
2. Sign in with either account above.
3. **As the employee**: use "Mark attendance" to add today's status (present/absent);
   click Edit or Delete on any row to change it. Use "Request leave" to submit a date
   range and reason. The dashboard at the top shows present-day count and pending
   requests for the selected month.
4. **As the manager**: the dashboard filters attendance and leave by month and by
   employee. Approve or Reject any pending leave request with one click; the change
   is reflected immediately (Firestore is live, no refresh needed).

## Project structure

```
attendly/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── app-user.model.ts        # AppUser, UserRole types
│   │   │   │   ├── attendance.model.ts      # AttendanceRecord, AttendanceStatus
│   │   │   │   └── leave.model.ts           # LeaveRequest, LeaveStatus
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts          # Firebase Auth + role lookup
│   │   │   │   ├── attendance.service.ts    # Firestore CRUD for attendance
│   │   │   │   └── leave.service.ts         # Firestore CRUD for leave
│   │   │   └── guards/
│   │   │       ├── auth.guard.ts            # must be signed in
│   │   │       └── role.guard.ts            # employee vs manager routing
│   │   ├── features/
│   │   │   ├── login/                       # sign-in with employee/manager tabs
│   │   │   ├── employee-dashboard/          # mark attendance, request leave
│   │   │   ├── manager-dashboard/           # approve/reject, team filters
│   │   │   └── home-redirect.component.ts   # role-based routing + error state
│   │   ├── app.component.ts / .html          # topbar + router outlet
│   │   ├── app.config.ts                     # Firebase/router providers
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── firestore.rules              # role-based security rules
├── firestore.indexes.json       # composite indexes for the app's queries
├── firebase.json                # Hosting + Firestore deploy config
├── .firebaserc                  # project alias (attendly-demo)
├── angular.json
├── package.json
├── tsconfig.json / tsconfig.app.json
├── .gitignore
└── README.md
```

Roles aren't stored in Firebase Auth (it doesn't have a native concept of roles) — they
live in a `users/{uid}` Firestore document per person, and `firestore.rules` reads that
document to decide what each signed-in user is allowed to do.

## One-time setup

You need your own free Firebase project — the one in this repo's `environment.ts` is a
placeholder and will not work.

### 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add
   project** → give it any name → finish the wizard (you can skip Google Analytics).
2. In the project, click the **Web** icon (`</>`) to register a web app. Copy the
   `firebaseConfig` object it shows you.
3. Paste those values into `src/environments/environment.ts` **and**
   `src/environments/environment.prod.ts` (replace every `REPLACE_WITH_...` field).

### 2. Turn on Auth and Firestore

1. **Build → Authentication → Get started → Sign-in method** → enable **Email/Password**.
2. **Build → Firestore Database → Create database** → start in production mode → pick
   any region.

### 3. Seed two demo accounts (one employee, one manager)

1. **Authentication → Users → Add user** — create the employee account (e.g.
   `employee@attendly.test` / a password you choose). Copy the **User UID** shown.
2. Repeat for the manager account (e.g. `manager@attendly.test`).
3. **Firestore Database → Start collection** → collection ID `users`.
   - Document ID: paste the **employee's UID**. Fields:
     - `uid` (string) = the same UID
     - `email` (string) = `employee@attendly.test`
     - `displayName` (string) = e.g. `Asha Rao`
     - `role` (string) = `employee`
   - Add a second document, Document ID = the **manager's UID**, same fields but
     `role` = `manager` and a manager email/name.
4. Update the "Demo login" section above with the real email/password you chose, so
   the reviewer can sign in.

### 4. Install dependencies and run locally

```bash
npm install
npm start
```

Open `http://localhost:4200`, sign in with either seeded account, and confirm data
reads/writes live in the Firestore console as you use the app.

### 5. Deploy (Firebase Hosting)

```bash
npm install -g firebase-tools     # if you don't have it
firebase login
firebase use --add                # pick your Firebase project, alias it "default"
npm run build
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

Firebase CLI prints the live Hosting URL when the deploy finishes — that's your demo
URL. (Any other static host works too, as long as the build output in `dist/attendly/browser`
is served and Firestore/Auth still point at the same Firebase project.)

## Data model

- `attendance/{id}`: `{ uid, employeeName, date ("YYYY-MM-DD"), status ("present"|"absent"), createdAt }`
- `leave/{id}`: `{ uid, employeeName, from, to, reason, status ("pending"|"approved"|"rejected"), createdAt }`
- `users/{uid}`: `{ uid, email, displayName, role ("employee"|"manager") }` — seeded manually, not editable from the app.

## Notes on scope

This intentionally stays small: no employee self-signup (accounts are seeded, which
is realistic for an internal HR tool), no password reset flow, no pagination on
records. See the written explanation (Part 2) for what was left out and why.
