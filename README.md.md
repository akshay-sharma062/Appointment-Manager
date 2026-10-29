# Appointment Manager — Freelancer Practical Assessment

> **Project type:** MERN full-stack assessment  
> **Time limit:** 90 minutes  
> **Purpose:** Build a small, working appointment-management application and demonstrate requirements analysis, implementation, testing, and handover.

This README is the project specification and development guide for building the assessment project with Antigravity. Keep the implementation aligned with the supplied candidate brief. Do not add unnecessary features that threaten the 90-minute scope.

---

## 1. Project overview

Build a responsive web application called **Appointment Manager**. A user should be able to view appointments, create a new appointment, change its status, filter by status, and search by customer name once the assessment change request is introduced.

The app must use a **React frontend** and a **Node.js/Express backend**. Persist appointments in **MongoDB if the environment allows within the time limit**. If database setup becomes a blocker, report it promptly and clearly document the fallback and its limitations.

### Main goals

- Implement the required appointment-management workflows.
- Provide clear validation errors.
- Keep the interface clean and usable on desktop and mobile.
- Test the main flows rather than claiming untested features work.
- Provide setup instructions, API notes, test notes, limitations, and one explained technical decision.

## 2. Required technology

Use the MERN stack:

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB, if feasible within the time limit
- **Language:** JavaScript or TypeScript
- **Styling:** CSS or Tailwind CSS (choose whichever can be implemented reliably and quickly)

A starter template may be used, but any existing code and AI assistance must be disclosed. This project is intended as a screening exercise, not a production deliverable.

## 3. Functional requirements

### 3.1 View appointments

Display an appointment list/table with these fields:

- Customer name
- Service
- Date and time
- Status

Use status labels/badges for **Pending**, **Confirmed**, and **Cancelled**.

### 3.2 Add an appointment

Provide a form that lets the user create an appointment with:

- Customer name
- Service
- Date and time
- Status

Requirements:

- Validate all required fields.
- Display clear, human-readable errors near the relevant field or in a visible form message.
- Do not create an appointment when required fields are missing.
- On success, update the list and show a concise success message if practical.

### 3.3 Change appointment status

Allow a user to change an existing appointment's status among:

- Pending
- Confirmed
- Cancelled

The updated status should appear in the list immediately after a successful update.

### 3.4 Filter by status

Provide filters for:

- All
- Pending
- Confirmed
- Cancelled

The selected filter should show only matching appointments. **All** should show every appointment.

### 3.5 Customer-name search — assessment change request

At approximately minute 50, the assessor will provide a small change request to add customer-name search. Design the list/filter logic so a search field can be added without a major rewrite.

Expected behavior:

- Provide a search input for customer name.
- Search should be case-insensitive.
- Match partial names (for example, `alex` should match `Alex Morgan`).
- Search and status filter should work together.
- Show a useful empty state when there are no matches.

During the assessment, clarify the exact search expectation with the assessor and explain any effect on the remaining plan before implementing it.

### 3.6 Responsive interface

The interface must be clean and usable on:

- Desktop
- Mobile

Prioritize readable text, clear form controls, usable spacing, and a list layout that remains understandable on narrow screens. Avoid spending assessment time on complex animations or decorative features.

## 4. Initial sample data

Seed the application with the following three fictional appointments. They may be inserted into MongoDB during setup or used as clearly identified demo fallback data if persistence cannot be configured in time.

| Customer | Service | Date | Time | Status |
|---|---|---|---|---|
| Alex Morgan | Consultation | 2026-11-02 | 10:00 | Pending |
| Jamie Lee | Follow-up | 2026-11-02 | 11:30 | Confirmed |
| Taylor Smith | Review | 2026-11-03 | 14:00 | Cancelled |

Do not use real customer or production data.

## 5. Suggested interface

Keep the UI professional, simple, and easy to demonstrate.

### Dashboard header
- App name: **Appointment Manager**
- Short subtitle such as “Manage upcoming appointments”
- A clear **Add appointment** action

### Summary area (optional)
If time permits, show small counts for:
- Total appointments
- Pending
- Confirmed
- Cancelled

These are optional polish, not core requirements. Do not prioritize them over required workflows.

### Appointment list
- Customer name
- Service
- Date/time
- Status badge
- Status-change control

### Add form
Use clear labels and appropriate controls:
- Text input for customer name
- Text input or select for service
- Date/time input
- Status select

A modal/drawer or inline form is acceptable; choose the fastest accessible approach.

### UI behavior
- Loading indicator while fetching/saving data, if applicable.
- Error message when an API request fails.
- Empty state if there are no appointments or no search/filter matches.
- Disable submit while saving to reduce accidental duplicate submissions, if practical.

No specific branding, color palette, component library, or animation is mandated by the candidate brief. Choose a consistent visual style and keep functionality first.

## 6. Backend and persistence

Create a Node.js/Express API. Use MongoDB for persistence if the environment allows within the assessment time.

### Suggested API endpoints

The brief requires an API but does not prescribe endpoint names. The following REST endpoints are a practical implementation proposal:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/appointments` | Retrieve appointments |
| `POST` | `/api/appointments` | Create an appointment |
| `PATCH` | `/api/appointments/:id/status` | Change an appointment's status |
| `GET` | `/api/health` | Optional health check |

Suggested create request body:

```json
{
  "customerName": "Alex Morgan",
  "service": "Consultation",
  "dateTime": "2026-11-02T10:00:00",
  "status": "Pending"
}
```

Suggested status update request body:

```json
{
  "status": "Confirmed"
}
```

### Backend validation

Validate incoming data on the server as well as on the frontend:

- Customer name is present and not just whitespace.
- Service is present and not just whitespace.
- Date/time is valid.
- Status is one of `Pending`, `Confirmed`, or `Cancelled`.
- Return useful HTTP status codes and clear error messages.
- Handle missing/invalid appointment IDs and database/API failures gracefully.

### Persistence rules

- If MongoDB is configured, new appointments and status updates must survive a page refresh.
- Do not silently present in-memory demo data as persistent storage.
- If MongoDB setup cannot be completed within the time limit, communicate the blocker and document what is and is not persisted.
- Never commit database credentials or other secrets.

## 7. Suggested project structure

A simple structure is preferred. Antigravity may adjust it if there is a clear reason.

```text
appointment-manager/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/            # or App.jsx for a small app
│   │   ├── services/         # API client/helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── ...
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── app.js
│   ├── package.json
│   └── ...
├── .env.example
├── .gitignore
├── package.json             # Optional root scripts
└── README.md
```

Keep the code straightforward and easy to explain. Avoid overengineering, unnecessary abstractions, and extra services.

## 8. Environment configuration

Create a `.env.example` file containing placeholders only, for example:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/appointment_manager
CLIENT_ORIGIN=http://localhost:5173
```

These values are examples. Adjust them to match the implementation. Never put real credentials in `.env.example` or commit a real `.env` file.

## 9. Time-boxed assessment plan

The assessment lasts **90 minutes**. Follow this plan and give concise progress updates when requested.

| Time | Focus | Expected outcome |
|---|---|---|
| 0–10 min | Read requirements, clarify assumptions, share a short plan | Clear understanding and scope |
| 10–20 min | Set up project structure | Frontend and backend skeleton |
| 20–55 min | Build list, add form, validation, status update, status filters | Core UI and workflows |
| Around minute 50 | Receive and clarify customer-name search change request | Confirm behavior and impact |
| 55–70 min | Implement API and persistence, or promptly report environment blocker | API working; MongoDB if feasible |
| 70–80 min | Test key flows and fix defects | Verified core behavior |
| 80–90 min | Demonstrate and hand over | Working demo and documentation |

This schedule is a guide, not a reason to skip essential testing. If time is running short, prioritize core functionality and report remaining work honestly.

## 10. Testing checklist

Test these items before the final demo:

- [ ] Initial sample appointments are displayed.
- [ ] A valid appointment can be added.
- [ ] Missing customer name is rejected with a clear error.
- [ ] Missing service is rejected with a clear error.
- [ ] Missing or invalid date/time is rejected with a clear error.
- [ ] An appointment's status can be changed.
- [ ] All filter shows every appointment.
- [ ] Pending filter shows only Pending appointments.
- [ ] Confirmed filter shows only Confirmed appointments.
- [ ] Cancelled filter shows only Cancelled appointments.
- [ ] Customer-name search works for partial, case-insensitive matches.
- [ ] Search and status filter work together.
- [ ] Empty states are clear.
- [ ] API errors are communicated to the user.
- [ ] Layout remains usable on a mobile-width screen.
- [ ] Refreshing the page preserves changes when MongoDB persistence is configured.
- [ ] If persistence is not configured, that limitation is clearly disclosed.

Only mark a test as passed after actually running it.

## 11. Final demonstration checklist

Demonstrate these five workflows:

1. Add an appointment.
2. Change its status.
3. Filter by status.
4. Search by customer name.
5. Refresh the page and show whether changes persist.

Be ready to explain:
- The frontend-to-backend request flow.
- How validation is handled.
- How status filtering and customer search work together.
- One technical decision and why you made it.
- Any incomplete features or known limitations.

## 12. Handover and submission requirements

Before handover, provide:

- [ ] Working local demo or agreed demonstration.
- [ ] Source code in a repository or agreed package.
- [ ] README setup/run instructions.
- [ ] `.env.example` with placeholders only.
- [ ] Brief API documentation.
- [ ] Tests performed and their actual results.
- [ ] Completed features.
- [ ] Incomplete features and known limitations.
- [ ] One short explanation of a technical decision.
- [ ] Disclosure of starter code and AI assistance used.

## 13. Rules and boundaries

- Ask questions if a requirement is unclear; state assumptions instead of silently guessing.
- Report blockers promptly.
- Do not claim a feature is complete unless it has been tested.
- Do not commit passwords, tokens, database credentials, or other secrets.
- Use fictional data only.
- Do not access production systems or incur paid service costs.
- Keep scope appropriate for a 90-minute screening exercise.
- If the full scope cannot be completed, prioritize the required features and clearly explain what remains.

## 14. Technical decision note — complete before handover

Write a short note explaining one real decision made during implementation. Example topics include:
- Why the UI uses a table on desktop and cards on mobile.
- Why search and status filtering are combined in one derived list.
- How the app handles API loading and error states.
- How the MongoDB persistence fallback is communicated.

Use the decision you actually implemented; do not copy an example that does not match the code.

## 15. AI development instruction for Antigravity

Use this file as the source of truth for the implementation.

1. Inspect the current folder before changing files.
2. Build the smallest complete implementation that satisfies the required features.
3. Use React, Node.js, Express, and MongoDB when feasible.
4. Keep frontend and backend code readable and explainable by a junior developer.
5. Do not add authentication, payments, calendar integrations, email/SMS notifications, or other unrequested scope.
6. Make the customer-name search easy to demonstrate and ensure it works together with status filtering.
7. Add `.env.example`, `.gitignore`, API notes, and test instructions.
8. Run the available build/lint/test checks and fix errors where possible.
9. Do not report tests as passed unless they were actually run.
10. At completion, summarize the implemented features, exact run commands, test results, known limitations, and one technical decision.

**Definition of done:** The app can list appointments, add one with validation, update status, filter by status, search by customer name, and clearly demonstrate whether changes persist after refresh. The project includes setup instructions and an honest test/limitations report.
