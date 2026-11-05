# LocalWait Times ⏱️

> A community-submitted wait-time journal for local service points (copy shops, bank counters, post offices, government service desks, clinics/pharmacies, and more).

LocalWait Times helps neighbors avoid peak lines by showing **typical wait ranges by time period** derived from community observations. Every piece of wait data is explicitly labeled and tracked as **"User-reported"** because it reflects real citizen experiences, not official or automated vendor numbers.

---

## 🌟 Key Features

- **Typical Wait Distributions**: Calculates the 25th–75th percentile (interquartile range) for 5 distinct time buckets to prevent extreme outliers from skewing wait expectations.
- **Sparse Data Awareness**: Automatically flags buckets with fewer than 3 reports with `insufficient: true`, clearly displaying *"Not enough reports yet"* instead of premature numbers.
- **Strictly User-Reported**: Community disclaimer prominently displayed on headers, badges, footers, and cards.
- **Server-Derived Time Buckets**: Prevents client tampering by deriving time of day (`Early Morning`, `Morning`, `Afternoon`, `Evening`, `Late`) and day type (`Weekday`, `Weekend`) strictly server-side using the configured timezone.
- **Responsive & Accessible**: Mobile-first design (tested down to 360px), accessible color contrast, touch targets $\ge 44\text{px}$, and keyboard navigation.

---

## 📐 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React
- **Backend**: Node.js (LTS), Express, Mongoose, Helmet, CORS, Express-Rate-Limit, Express-Validator
- **Database**: MongoDB (via `MONGODB_URI` from `.env`; default `mongodb://127.0.0.1:27017/localwait` with seamless local memory fallback if MongoDB service is not started)
- **Monorepo Layout**:
  - `/client` — Vite + React frontend
  - `/server` — Express + Mongoose API

---

## 📂 Project Structure

```
LocalWait Times/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badge.jsx            # Category & User-reported badge badges
│   │   │   ├── EmptyState.jsx       # Fallback empty UI
│   │   │   ├── ErrorMessage.jsx     # Alert banner with validation details
│   │   │   ├── Footer.jsx           # Disclaimers and links
│   │   │   ├── Loader.jsx           # Accessible loading indicator
│   │   │   ├── Navbar.jsx           # Responsive header and notices
│   │   │   └── TypicalWaitCard.jsx  # Percentile wait card by time period
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Search, category pills, location cards
│   │   │   ├── PlaceDetailPage.jsx  # Typical waits, log wait form, recent reports
│   │   │   ├── AddPlacePage.jsx     # Register new service point
│   │   │   └── NotFoundPage.jsx     # 404 handler
│   │   ├── api.js                   # Universal API client
│   │   ├── App.jsx                  # React Router routes
│   │   ├── index.css                # Tailwind directives
│   │   └── main.jsx                 # Entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # Resilient MongoDB connector
│   │   │   └── env.js               # Environment config
│   │   ├── controllers/
│   │   │   ├── placeController.js   # List, create, get places
│   │   │   ├── reportController.js  # Submit & list reports
│   │   │   └── statsController.js   # Typical wait percentiles & insufficient checks
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Central error handler + 404 middleware
│   │   │   ├── rateLimiter.js       # Express rate limiter (30 req / 15 min)
│   │   │   └── validation.js        # Strict input validation & disallow extra fields
│   │   ├── models/
│   │   │   ├── Place.js             # Place schema with unique compound index
│   │   │   └── WaitReport.js        # WaitReport schema with server derivation
│   │   ├── routes/
│   │   │   ├── healthRoutes.js      # GET /api/health
│   │   │   ├── placeRoutes.js       # REST endpoints for places & reports
│   │   │   └── index.js             # Route combiner
│   │   ├── scripts/
│   │   │   └── seed.js              # Seed script (~45 realistic reports)
│   │   ├── utils/
│   │   │   ├── asyncHandler.js      # Express async wrapper
│   │   │   ├── percentile.js        # 25th-75th percentile computation
│   │   │   ├── sanitize.js          # HTML sanitizer for notes
│   │   │   └── timeBuckets.js       # Timezone & period derivation
│   │   ├── app.js                   # Express app setup
│   │   └── index.js                 # Server entry point
│   ├── .env.example
│   └── package.json
├── package.json                     # Monorepo root scripts
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ LTS
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/localwait`) or any MongoDB Atlas connection string. (If local MongoDB is not running, the server automatically starts an in-memory instance for effortless zero-setup development).

### 2. Environment Setup

**Server (`/server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/localwait
CLIENT_ORIGIN=http://localhost:5173
TZ_OFFSET=Asia/Kolkata
NODE_ENV=development
```

**Client (`/client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies
```bash
# In /server
cd server
npm install

# In /client
cd ../client
npm install
```

### 4. Seed the Database
Populate 5 sample service locations and ~45 realistic community reports across all 5 time periods:
```bash
cd server
npm run seed
```

### 5. Run the Application
In terminal 1 (start Express API on port 5000):
```bash
cd server
npm run dev
# or npm start
```

In terminal 2 (start Vite React frontend on port 5173):
```bash
cd client
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 REST API Reference

All API endpoints are prefixed with `/api` and return standardized JSON shapes.

| Method | Endpoint | Description | Query / Body Params | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check | None | `{ status: "ok" }` |
| `GET` | `/api/places` | Paginated places with `reportCount` | `?search=&category=&page=&limit=` | `{ success: true, data: { places: [...], pagination: {...} } }` |
| `POST` | `/api/places` | Register a new service place | `{ name, category, address? }` | `{ success: true, data: { ...place } }` |
| `GET` | `/api/places/:id` | Place details with `reportCount` | `id` (ObjectId) | `{ success: true, data: { ...place, reportCount } }` |
| `GET` | `/api/places/:id/stats` | Typical wait ranges & percentiles | `id`, `?dayType=All\|Weekday\|Weekend` | `{ success: true, data: { source: "user-reported", periods: [...] } }` |
| `GET` | `/api/places/:id/reports` | Recent community reports | `id`, `?limit=10&page=1` | `{ success: true, data: { reports: [...] } }` |
| `POST` | `/api/places/:id/reports` | Submit a wait time report | `{ waitMinutes, visitedAt, note? }` | `{ success: true, data: { ...report, source: "user-reported" } }` |

### Error Shape
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": {
      "waitMinutes": "waitMinutes must be between 0 and 240 minutes"
    }
  }
}
```

---

## 📊 Stats Logic & Percentiles

Wait times in service points often experience extreme outliers (e.g., someone with complex paperwork holding up the counter for 90 minutes while the rest wait 12 minutes).

To provide actionable and honest guidance:
1. **90-Day Rolling Window**: Only reports from the past 90 days are included.
2. **25th to 75th Percentile**: `typicalRange.low` represents the 25th percentile ($Q_1$) and `typicalRange.high` represents the 75th percentile ($Q_3$).
3. **Median Wait**: 50th percentile ($Q_2$) represents the middle wait time.
4. **Insufficient Data Protection**: If a time bucket has fewer than 3 reports ($N < 3$), the API returns `insufficient: true` and `typicalRange: null`. The UI gracefully shows *"Not enough reports yet"* instead of an unreliable range.
5. **Community Attribution**: Every stats response explicitly carries `source: "user-reported"`.

---

## 📸 Screenshots

*(Place screenshots here)*

- **Home Page**: Search bar, category pills, place cards with report counts and "User-reported" badges.
- **Place Detail**: Typical wait cards across the 5 periods (Early Morning, Morning, Afternoon, Evening, Late), day-type toggle, and the "Log My Wait" submission form.
- **Add Place Form**: Clean form with validation and duplicate protection.

---

## 🧪 Testing & Verification

1. **Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```
2. **Create Place**:
   ```bash
   curl -X POST http://localhost:5000/api/places -H "Content-Type: application/json" -d "{\"name\":\"Sample Copy Center\",\"category\":\"Copy Shop\",\"address\":\"12 Tech Lane\"}"
   ```
3. **Submit Report**:
   ```bash
   curl -X POST http://localhost:5000/api/places/<PLACE_ID>/reports -H "Content-Type: application/json" -d "{\"waitMinutes\":15,\"visitedAt\":\"2026-11-04T10:00:00Z\",\"note\":\"Fast service\"}"
   ```
4. **Build Frontend**:
   ```bash
   cd client && npm run build
   ```
