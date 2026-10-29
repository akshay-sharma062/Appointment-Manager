# Appointment Manager — MERN Full-Stack Application

A clean, responsive, and robust appointment management application built with **React**, **Node.js**, **Express**, and **MongoDB**.

---

## 1. Quick Start & Run Instructions

### Prerequisites
- **Node.js** (v18+ recommended; tested on v24)
- **npm** (v9+)
- **MongoDB** running locally on port 27017 (or provide a remote URI in `.env`)

### Installation

Install dependencies for root, server, and client:

```bash
# In the project root:
npm run install:all
```

Or install individually:
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### Environment Configuration

Copy `.env.example` to `server/.env` (or configure root `.env`):
```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/appointment_manager
CLIENT_ORIGIN=http://localhost:5173
```

### Running the Application

1. **Start MongoDB**:
   Ensure MongoDB service is running (e.g. `net start MongoDB` or via Windows Services).

2. **Start Backend Server**:
   ```bash
   cd server
   npm start
   # Or for development auto-reload:
   npm run dev
   ```
   Server will start on `http://localhost:5000`.

3. **Start Frontend Client**:
   ```bash
   cd client
   npm run dev
   ```
   Client will start on `http://localhost:5173`.

4. **Open in Browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

---

## 2. Completed Features Summary

- [x] **Initial Sample Data Seeding**: Automatically seeds the 3 specified sample appointments on first run if the database is empty:
  - *Alex Morgan* | Consultation | 2026-11-02 10:00 | Pending
  - *Jamie Lee* | Follow-up | 2026-11-02 11:30 | Confirmed
  - *Taylor Smith* | Review | 2026-11-03 14:00 | Cancelled
- [x] **View Appointments**: Responsive list displaying Customer Name, Service, formatted Date/Time, and colored Status Badges (Pending, Confirmed, Cancelled).
- [x] **Summary Metrics Area**: Cards displaying counts for Total, Pending, Confirmed, and Cancelled appointments in real-time.
- [x] **Add Appointment Workflow**: Modal form with strict validation for Customer Name, Service (presets or custom), Date & Time, and Status. Disables submission during saving to prevent duplicates.
- [x] **Change Appointment Status**: Direct inline dropdown status selector for each appointment with instant state update and backend persistence.
- [x] **Status Filtering**: Filter buttons for All, Pending, Confirmed, Cancelled with dynamic record counts.
- [x] **Customer-Name Search (Change Request)**: Case-insensitive, partial string matching (e.g., `alex` matches `Alex Morgan`). Search input includes a quick clear button.
- [x] **Combined Filtering & Search**: Status filtering and customer search operate concurrently without conflicts.
- [x] **Clean Empty & Error States**: Contextual messages and "Clear Filters" action when queries yield no results. Clear user feedback banners for errors and successful actions.
- [x] **MongoDB Persistence**: Real-time status indicator in header displaying database connection state. Changes persist across page reloads.
- [x] **Responsive Layout**: Desktop table layout for larger screens and card view optimized for mobile devices.

---

## 3. API Documentation

### Base URL: `/api`

| Method | Endpoint | Description | Request Body / Query Params |
|---|---|---|---|
| `GET` | `/api/health` | Health check & MongoDB connection status | None |
| `GET` | `/api/appointments` | Retrieve appointments list | Optional query: `?status=Pending&search=alex` |
| `POST` | `/api/appointments` | Create a new appointment | JSON body with required fields |
| `PATCH` | `/api/appointments/:id/status` | Update status of an appointment | JSON body: `{ "status": "Confirmed" }` |

#### Create Appointment Payload:
```json
{
  "customerName": "Alex Morgan",
  "service": "Consultation",
  "dateTime": "2026-11-02T10:00:00",
  "status": "Pending"
}
```

#### Status Update Payload:
```json
{
  "status": "Confirmed"
}
```

---

## 4. Test Checklist & Verification Results

All tests below were executed against the running MongoDB instance and Node.js server:

| Test Item | Status | Verification Method |
|---|---|---|
| Initial sample appointments displayed | **PASS** | Automated test & Seed verification |
| Valid appointment creation | **PASS** | Supertest `POST /api/appointments` (201 Created) |
| Missing customer name rejected | **PASS** | Supertest validation check (400 Bad Request) |
| Missing service rejected | **PASS** | Supertest validation check (400 Bad Request) |
| Missing / invalid date rejected | **PASS** | Supertest validation check (400 Bad Request) |
| Invalid status rejected | **PASS** | Supertest validation check (400 Bad Request) |
| Status change (Pending -> Confirmed) | **PASS** | Supertest `PATCH /api/appointments/:id/status` (200 OK) |
| Filter by "Confirmed" | **PASS** | Query test returns only Confirmed records |
| Customer-name search (case-insensitive & partial) | **PASS** | Query `?search=alex` returns "Alex Morgan" |
| Combined search + status filter | **PASS** | Query `?search=alex&status=Confirmed` returns 0; with `Pending` returns 1 |
| 404 on non-existent appointment ID | **PASS** | Supertest `PATCH` with non-existent ID |
| Frontend production build | **PASS** | `vite build` completed with 0 errors |
| Data persistence across refresh | **PASS** | Verified in MongoDB database `appointment_manager` |

To run the automated backend test suite:
```bash
npm run test:server
# or
cd server && npm test
```

---

## 5. Technical Decision Note

### Technical Decision: Combined In-Memory Derived Filtering with Backend Query Alignment

**Why this decision was made:**
During requirements analysis for the customer-name search change request (Section 3.5), we evaluated two primary architectural approaches:
1. Triggering an asynchronous API request on every keystroke in the search bar.
2. Deriving the displayed appointments through a memoized React selector (`useMemo`) over the loaded state, while maintaining identical query capabilities (`?search=` and `?status=`) on the Express backend endpoint.

We chose the second approach with backend query alignment. In a screening and demonstration context with manageable dataset sizes, computing filtered results synchronously on keystrokes produces zero input lag, avoids flickering spinners, prevents race conditions from out-of-order responses, and works even when connectivity is intermittently slow. Furthermore, keeping identical regex and status filter logic on the backend endpoint (`GET /api/appointments?search=...&status=...`) guarantees that external API consumers and direct network requests follow identical matching rules.

---

## 6. Known Limitations

1. **Authentication & Authorization**: As instructed, no authentication or role-based access control was implemented. Anyone with network access can view or edit appointments.
2. **Timezone Handling**: Dates are saved as standard UTC in MongoDB and rendered in the user's browser local timezone. For global teams across multiple time zones, an explicit timezone selector could be added.
3. **Pagination**: The API currently returns all matching records. For large enterprise scale (>10,000 appointments), cursor-based pagination would be recommended.

---

## 7. AI Assistance Disclosure

Developed with the assistance of Antigravity AI coding assistant to scaffold boilerplate and verify test suites in accordance with assessment requirements. All business logic, schemas, and endpoints comply with the candidate brief.

