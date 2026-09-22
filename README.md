# DoctorLink

A doctor appointment and clinic management platform. Patients find a verified doctor, book a time slot, pay online and keep talking to that doctor afterwards. Doctors manage their availability, appointments and earnings. Administrators verify doctor credentials and oversee the whole system.

The project ships three clients against one REST API: a React web app, a Flutter mobile app, and an admin portal that lives inside the web app.

**Live preview:** [sumail-000.github.io/doctorlink](https://sumail-000.github.io/doctorlink/)

The preview is the web client only. GitHub Pages serves static files, so it cannot run the API — the interface renders, but anything that needs data (sign-in, doctor search, booking) will fail until `VITE_API_URL` points at a deployed backend. See [Deployment](#deployment) for how to connect one.

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Scheduled jobs](#scheduled-jobs)
- [Deployment](#deployment)
- [Maintenance scripts](#maintenance-scripts)

---

## Overview

DoctorLink models the full appointment lifecycle rather than just a booking form.

A doctor cannot accept patients until an administrator has reviewed their PMC registration number, CNIC and uploaded credentials. Once approved, they publish a weekly schedule; the API turns that schedule into concrete bookable slots and hides any slot that is already taken.

A patient picks a slot, pays the doctor's fee through Stripe Checkout, and the appointment moves from `pending` to `confirmed` only after payment settles. From there it can be completed with a prescription attached, cancelled with an automatic refund, rescheduled by either side subject to the other's approval, or flagged as a no-show by a nightly job if nobody closed it out.

Every state change notifies the other party in-app, and patient and doctor keep a private message thread tied to their shared history.

### Roles

| Role | Entry point | Can do |
| --- | --- | --- |
| **Patient** | Public sign-up | Search doctors, book and pay, review after a visit, message their doctor, analyse symptoms |
| **Doctor** | Application form, then admin approval | Set weekly availability, accept or reject requests, complete visits, issue prescriptions, refer to a colleague, track earnings |
| **Admin** | Separate portal login | Approve or reject doctor applications, manage users, override appointment status, view payment and revenue reports, publish announcements, answer contact messages, configure platform settings |

---

## Features

### Patients

- Search and filter the doctor directory by specialisation, city, fee and rating
- Doctor profiles with qualifications, experience, languages, patient reviews and a clinic map
- Slot-based booking that reflects the doctor's real weekly schedule
- Stripe Checkout payment, with automatic refund on cancellation
- Appointment history with prescriptions and referral notes
- Direct messaging with the doctor
- Star reviews that feed back into the doctor's rating
- **Symptom analyser** — describe symptoms, optionally attach a photo, and get a suggested specialisation, an urgency level, red flags to watch for and safe self-care tips, plus a shortlist of matching doctors to book. It is a triage aid: it never diagnoses or prescribes, declines anything that is not a medical question, and escalates possible emergencies to immediate in-person care.

### Doctors

- Application flow capturing PMC number, CNIC, degree and supporting documents
- Weekly schedule editor with per-day time ranges
- Incoming request queue with accept, reject and reschedule-proposal actions
- Appointment detail view with prescription upload and referral to another doctor
- Patient list built from past appointments
- Earnings dashboard with per-period revenue breakdown
- Profile and clinic location management, geocoded for the map

### Administrators

- Dashboard of platform-wide counts and trends
- Pending doctor approvals with full credential review before granting access
- User management: inspect, block, unblock and reset passwords
- Appointment oversight with manual status override
- Payment ledger and revenue reports
- Site-wide announcement banners that users can dismiss
- Contact form inbox with read tracking
- Configurable platform settings, with a reset-to-defaults action
- Bulk doctor directory import from an external listing source

---

## Tech stack

| Layer | Technology |
| --- | --- |
| **API** | Node.js 20, Express 4, Mongoose 8 |
| **Database** | MongoDB |
| **Auth** | JSON Web Tokens, bcrypt password hashing |
| **Payments** | Stripe Checkout and webhooks |
| **File uploads** | Multer (avatars, credential documents, prescriptions) |
| **Geocoding** | OpenStreetMap Nominatim |
| **Web client** | React 19, Vite, Tailwind CSS 4, React Router 7, Axios, Framer Motion, Recharts |
| **Mobile client** | Flutter, Dio, Provider, shared_preferences, local notifications |
| **Hosting** | Vercel (API as serverless functions, web client as a static SPA) |

---

## Repository layout

```
doctorlink/
├── backend/            Express REST API
│   ├── api/            Vercel serverless entry point
│   ├── config/         Database connection
│   ├── controllers/    Request handlers, one per domain
│   ├── middleware/     JWT auth guard, file upload handling
│   ├── models/         Mongoose schemas
│   ├── routes/         Route definitions mounted under /api
│   ├── utils/          Cron jobs, geocoding, refunds, rate limiting,
│   │                   doctor ranking, directory import
│   ├── seeder.js       Sample data loader
│   └── server.js       Local development entry point
│
├── frontend/           React single-page application
│   └── src/
│       ├── api/        Axios instance and per-domain API clients
│       ├── components/ Shared UI and layout sections
│       ├── context/    Auth, theme and toast providers
│       └── pages/      Routed screens, grouped by audience
│                       (public / patient / doctor / admin / shared)
│
├── mobile/             Flutter application
│   └── lib/
│       ├── core/       API service, theming
│       ├── providers/  State management
│       ├── screens/    auth / patient / doctor / settings / shared
│       └── widgets/    Reusable components
│
└── docs/               Requirement and specification documents
```

---

## Getting started

### Prerequisites

- Node.js 20 or newer
- A MongoDB instance (local or Atlas)
- A Stripe account in test mode
- Flutter SDK 3.10 or newer, only if you are running the mobile client

### 1. API

```bash
cd backend
npm install
cp .env.example .env     # then fill in the values
npm run dev              # http://localhost:5000
```

Optionally load sample doctors, patients and appointments:

```bash
npm run seed
```

Confirm the API is up:

```bash
curl http://localhost:5000/api/health
```

### 2. Web client

```bash
cd frontend
npm install
cp .env.example .env     # then set VITE_API_URL
npm run dev              # http://localhost:5173
```

The development server accepts any `localhost` port, so it is fine if Vite falls back to 5174 or 5175.

### 3. Mobile client

```bash
cd mobile
flutter pub get
flutter run
```

The app defaults to the deployed API. To point it at your own machine, open **Settings → Server** inside the app and enter your API base URL — no rebuild required. On an Android emulator, `localhost` on your machine is reachable at `10.0.2.2`.

### 4. Stripe webhooks in development

Checkout completion arrives by webhook, so an appointment stays `pending` until Stripe can reach you:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copy the signing secret it prints into `STRIPE_WEBHOOK_SECRET`.

---

## Environment variables

### `backend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | yes | `development` or `production`. Outside production, any localhost origin is allowed through CORS. |
| `PORT` | no | API port. Defaults to `5000`. |
| `MONGO_URI` | yes | MongoDB connection string. |
| `JWT_SECRET` | yes | Signing secret for access tokens. |
| `JWT_EXPIRE` | no | Token lifetime, e.g. `30d`. |
| `STRIPE_SECRET_KEY` | yes | Stripe secret key. |
| `STRIPE_PUBLISHABLE_KEY` | no | Stripe publishable key. |
| `STRIPE_WEBHOOK_SECRET` | yes | Signing secret for the checkout webhook. |
| `CLIENT_URL` | yes | Allowed web origin(s), comma-separated. Also used to build Stripe return URLs. |
| `ANTHROPIC_API_KEY` | yes | Key for the symptom analyser. Without it that one feature is unavailable; everything else runs normally. |

### `frontend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | no | API base URL including the `/api` suffix. Defaults to `http://localhost:5000/api`. |

Never commit a real `.env`. Both are ignored by git; copy the `.env.example` next to each one instead.

---

## API reference

All routes are mounted under `/api`. Protected routes expect an `Authorization: Bearer <token>` header.

### Authentication — `/api/auth`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/register` | Create a patient account |
| `POST` | `/login` | Exchange credentials for a token |
| `POST` | `/forgot-password` | Begin password recovery |
| `POST` | `/reset-password/:token` | Complete password recovery |
| `GET` | `/me` | Current user profile |
| `PUT` | `/profile` | Update profile details |
| `PUT` | `/password` | Change password while signed in |

### Doctors — `/api/doctors`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/apply` | Submit a doctor application with documents |
| `POST` | `/login` | Doctor sign-in |
| `GET` | `/` | Browse and filter approved doctors |
| `GET` | `/recommended` | Top-ranked doctors, optionally for a specialisation |
| `GET` | `/recommended-for-me` | Personalised suggestions for the signed-in patient |
| `GET` | `/:id` | Public doctor profile |
| `GET` | `/:id/slots` | Bookable slots for a given date |
| `GET`, `PUT` | `/me/profile` | Read or update own profile |
| `PUT` | `/me/schedule` | Replace the weekly availability |
| `GET` | `/me/dashboard` | Own summary counts |
| `GET` | `/me/patients` | Patients seen so far |
| `GET` | `/me/earnings` | Earnings breakdown |
| `POST` | `/me/geocode` | Resolve the clinic address to coordinates |

### Appointments — `/api/appointments`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/` | Request an appointment |
| `GET` | `/my` | Patient's appointments |
| `GET` | `/doctor` | Doctor's appointments |
| `GET` | `/doctor/no-shows` | Doctor's flagged no-shows |
| `GET` | `/dashboard` | Summary counts for the current role |
| `GET` | `/:id` | Single appointment |
| `PUT` | `/:id/accept`, `/:id/reject` | Doctor responds to a request |
| `PUT` | `/:id/complete` | Close out a visit |
| `PUT` | `/:id/no-show` | Flag a missed appointment |
| `PUT` | `/:id/cancel` | Cancel, refunding if already paid |
| `PUT` | `/:id/reschedule` | Propose a new time |
| `PUT` | `/:id/reschedule/accept`, `/:id/reschedule/reject` | Respond to a proposal |
| `POST` | `/:id/prescription` | Attach a prescription |
| `POST` | `/:id/refer` | Refer the patient to another doctor |

### Payments — `/api/payments`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/create-checkout` | Open a Stripe Checkout session |
| `POST` | `/verify-session` | Confirm a session after redirect |
| `POST` | `/webhook` | Stripe event receiver |
| `POST` | `/simulate` | Mark an appointment paid without Stripe, for demos |
| `GET` | `/my` | Payment history |

### Messaging, reviews and notifications

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/messages/conversations` | Conversation list |
| `GET` | `/api/messages/thread` | Messages in one conversation |
| `POST` | `/api/messages` | Send a message |
| `PUT` | `/api/messages/read` | Mark a thread read |
| `GET` | `/api/messages/unread-count` | Unread badge count |
| `POST` | `/api/reviews` | Leave a review after a completed visit |
| `GET` | `/api/reviews/doctor/:doctorId` | Reviews for a doctor |
| `GET` | `/api/notifications/my` | Own notifications |
| `PUT` | `/api/notifications/:id/read`, `/read-all` | Mark as read |
| `GET` | `/api/announcements/active` | Active banners |
| `PUT` | `/api/announcements/:id/dismiss` | Dismiss a banner |
| `POST` | `/api/contact` | Submit the public contact form |

### Symptom analysis — `/api/ai`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/analyze-symptoms` | Submit symptoms and an optional image. Returns a severity level, a plain-language summary, suggested specialisations with confidence scores, red flags, self-care tips and matching doctors. Rate limited per user. |

### Administration — `/api/admin`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/dashboard` | Platform-wide statistics |
| `GET` | `/doctors`, `/doctors/pending`, `/doctors/:id/detail` | Review doctor records |
| `PUT` | `/doctors/:id/approve`, `/doctors/:id/reject` | Decide on an application |
| `GET` | `/users`, `/users/:id` | Browse accounts |
| `PUT` | `/users/:id/block`, `/unblock`, `/reset-password` | Moderate accounts |
| `GET` | `/appointments` | Oversee all appointments |
| `PUT` | `/appointments/:id/status` | Override an appointment's status |
| `GET` | `/payments`, `/reports` | Financial reporting |
| `GET`, `PUT` | `/settings`, plus `PUT /settings/reset` | Platform configuration |
| `GET`, `POST`, `PUT`, `DELETE` | `/announcements` | Manage announcement banners |
| `POST` | `/scrape-doctors` | Import doctors from an external directory |

---

## Data model

| Collection | Purpose |
| --- | --- |
| `User` | Account, credentials and role (`patient`, `doctor`, `admin`), plus contact and profile fields |
| `Doctor` | Professional record linked to a user: PMC number, CNIC, specialisation, fee, weekly schedule, clinic coordinates, approval status, aggregate rating and earnings |
| `Appointment` | Booking with lifecycle status (`pending`, `confirmed`, `completed`, `cancelled`, `no-show`, `rescheduling`, `expired`), payment status, prescription and referral |
| `Payment` | Stripe transaction record tied to an appointment |
| `Review` | Patient rating and comment, rolled up into the doctor's score |
| `Message` | One message in a patient–doctor thread |
| `Notification` | In-app alert for a state change |
| `Announcement` | Admin banner with per-user dismissal |
| `ContactMessage` | Public contact form submission |
| `Setting` | Platform configuration key/value store |

### Doctor ranking

Recommendations combine an exact specialisation match (the dominant term) with the doctor's rating, a logarithmically saturating review count, capped patient volume and capped years of experience. The caps stop a single very busy or very senior doctor from crowding out everyone else.

---

## Scheduled jobs

Two nightly jobs keep appointment data honest:

| Job | Schedule | What it does |
| --- | --- | --- |
| No-show detection | 02:00 daily | Marks `confirmed` appointments as `no-show` once 24 hours past their slot with no outcome recorded |
| Reminders | 08:00 daily | Notifies patients and doctors about appointments coming up |

Running locally, `server.js` starts these in-process. On Vercel they run as platform cron jobs hitting `/api/cron/no-shows` and `/api/cron/reminders`.

---

## Deployment

Both halves deploy to Vercel and each carries its own `vercel.json`.

**API** — `backend/api/index.js` is the serverless entry point; every `/api/*` request is rewritten to it, and the two cron schedules are declared alongside. Uploads are written to the serverless temp directory, which is not durable, so production should use object storage rather than the local `uploads/` folder.

**Web client** — a static Vite build with an SPA rewrite so client-side routes resolve on refresh. Set `VITE_API_URL` to the deployed API.

After deploying, set `CLIENT_URL` on the API to the web client's origin, and register the deployed webhook URL in the Stripe dashboard.

### GitHub Pages

`.github/workflows/deploy-frontend.yml` builds `frontend/` and publishes it to Pages on every push to `main` that touches that folder. Two details make a single-page app work on Pages:

- **Base path.** Pages serves a project site from `/<repo>/`, not the domain root, so the workflow sets `VITE_BASE_PATH` and `vite.config.js` picks it up. React Router reads the same value through `import.meta.env.BASE_URL`, so no route needs to hard-code the prefix.
- **Deep links.** Pages has no rewrite rules, so requesting `/doctorlink/doctors/123` directly returns its 404 page. `public/404.html` encodes the route into a query string and redirects to the app root, where a snippet in `index.html` restores it before React Router mounts. On a user page or custom domain served from the root, change `pathSegmentsToKeep` in `404.html` from `1` to `0`.

To point the published site at an API, set a repository variable named `VITE_API_URL` under **Settings → Secrets and variables → Actions → Variables**, then re-run the workflow. The backend's `CLIENT_URL` must include `https://<user>.github.io` or CORS will reject every request.

#### Publishing without Actions

The site currently deploys from the `gh-pages` branch rather than the workflow, because GitHub Actions is unavailable on this account. To publish an update by hand:

```bash
cd frontend
VITE_BASE_PATH=/doctorlink/ VITE_API_URL=<api-url> npm run build
cd dist && touch .nojekyll
git init -b gh-pages && git add -A && git commit -m "Publish web client build"
git push -f https://github.com/<user>/doctorlink.git gh-pages
```

To switch back to the workflow once Actions is available, set **Settings → Pages → Source** to *GitHub Actions*. The workflow file is already in place and needs no changes.

---

## Maintenance scripts

Run from `backend/` with a valid `.env` present:

```bash
node list-users.js                          # list every account with its role
node reset-user-pw.js <email> <password>    # set a new password for one account
npm run seed                                # load sample data
```

---

## About

Final-year project. Built and maintained by [sumail-000](https://github.com/sumail-000).
