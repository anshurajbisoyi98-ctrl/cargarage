# 🏎️ 1968 Ford Mustang Fastback — Cinematic Experience & Master Service Concierge

> **Comprehensive Technical Documentation & Mentor Defense Manual**  
> An interactive WebGL/CSS-driven automotive presentation engineered with a production-grade, secure, multi-tenant Node.js/Express REST API and MongoDB backend.

---

## 📑 Table of Contents
1. [Project Overview & System Architecture](#1-project-overview--system-architecture)
2. [Directory & File Structure](#2-directory--file-structure)
3. [The Frontend Visual Engine & Animations](#3-the-frontend-visual-engine--animations)
4. [Database Schemas & Data Modeling](#4-database-schemas--data-modeling)
5. [Complete Backend & CRUD Route Reference](#5-complete-backend--crud-route-reference)
   - [🔐 Authentication & User Registry](#51-authentication--user-registry)
   - [🚗 Vehicle Garage Management (CRUD)](#52-vehicle-garage-management-crud)
   - [📅 Service Booking & Workflow Lifecycle](#53-service-booking--workflow-lifecycle)
   - [📋 Certified Service Records & Invoicing (CRUD)](#54-certified-service-records--invoicing-crud)
   - [🔔 Smart Reminders & Maintenance Schedules (CRUD)](#55-smart-reminders--maintenance-schedules-crud)
   - [⚠️ Vehicle Diagnostics & Problem Reports (CRUD)](#56-vehicle-diagnostics--problem-reports-crud)
   - [🏢 Authorized Workshop Centers (CRUD)](#57-authorized-workshop-centers-crud)
   - [📊 Financial Analytics & Executive Dashboards](#58-financial-analytics--executive-dashboards)
   - [📬 Notification Center](#59-notification-center)
6. [Security Architecture & Resilience](#6-security-architecture--resilience)
7. [Customer vs Administrator Role Isolation](#7-customer-vs-administrator-role-isolation)
8. [Mentor Defense Q&A Cheat Sheet](#8-mentor-defense-qa-cheat-sheet)
9. [Installation, Environment & Execution](#9-installation-environment--execution)

---

## 1. Project Overview & System Architecture

This project is a hybrid automotive platform composed of two core subsystems:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER (PORT 5175)                              │
│  ┌──────────────────────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │   Cinematic Presentation (src/main.js)       │  │   Mustang Concierge Service      │  │
│  │   • Single-entry timer (0% → 100%)           │  │   (src/service.js + CSS)         │  │
│  │   • Automatic cinematic grand reveal         │  │   • Customer Garage & Bookings   │  │
│  │   • Landing & staying on 3rd scene (Details) │  │   • Admin 9-Module Control Bay   │  │
│  │   • Interactive slider & replay mechanics    │  │   • Real-time Notification Feed  │  │
│  └──────────────────────────────────────────────┘  └──────────────────────────────────┘  │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ HTTP REST Requests (with httpOnly JWT cookie)
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SERVER LAYER (PORT 5001)                              │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │   Express.js Application Pipeline (backend/app.js)                                 │  │
│  │   • Origin Guard & CSRF Barrier (Checks allowed domains & Content-Type)           │  │
│  │   • In-Memory IP Rate Limiter (Brute-force protection on auth endpoints)           │  │
│  │   • JWT Authentication & Strict Role-Based Access Control (RBAC)                   │  │
│  │   • Centralized Error Handler (Transforms Mongo/Cast errors into clear HTTP codes) │  │
│  └─────────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                            ▼                                             │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │   Controllers & Business Logic (backend/controllers/)                              │  │
│  │   • ACID MongoDB Transactions (`mongoose.connection.transaction`)                  │  │
│  │   • Strict Ownership Isolation (`ownedVehicle` security guard)                     │  │
│  │   • Automated Invoicing (`INV-YYYY-XXXX`) & Mileage Synchronization                │  │
│  │   • Event-driven Notifications for status progression and high-severity reports     │  │
│  └─────────────────────────────────────────┬──────────────────────────────────────────┘  │
└────────────────────────────────────────────┼─────────────────────────────────────────────┘
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DATABASE LAYER (MongoDB Atlas)                           │
│   Collections: Users | Vehicles | ServiceRequests | ServiceRecords |                      │
│                Reminders | ProblemReports | ServiceCenters | Notifications               │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & File Structure

```
caranimation/
├── backend/
│   ├── controllers/
│   │   ├── notificationController.js  # Unread counts, marking read, auto-dispatching alerts
│   │   ├── problemController.js       # Diagnostic issue reporting, severity levels, admin resolution
│   │   ├── reminderController.js      # Smart maintenance schedules, snooze timers (+3d, +7d, +14d)
│   │   ├── serviceCenterController.js # Authorized repair shop facilities management
│   │   ├── serviceController.js       # Bookings, Kanban workflow, transactions, invoicing & dashboard
│   │   ├── userController.js          # Registration, login, logout, profile update, role toggling
│   │   └── vehicleController.js       # Garage fleet CRUD, mileage verification, cascade deletion
│   ├── middleware/
│   │   └── index.js                   # JWT auth, admin authorization, ownership checker, validators
│   ├── models/
│   │   └── index.js                   # Mongoose schemas for all 8 collections
│   ├── routes/
│   │   └── index.js                   # Express router mapping endpoints to controller actions
│   ├── app.js                         # Express configuration, security filters, error handler
│   └── server.js                      # DB connection and HTTP listener on port 5001
├── public/                            # Static assets and icons
├── src/
│   ├── assets/                        # WebP studio imagery (revealed, covered, billow, detail)
│   ├── main.js                        # Cinematic camera controls, loading timer, grand reveal flow
│   ├── service.js                     # Concierge UI logic: Customer tabs & 9-module Admin Suite
│   ├── style.css                      # Styling for the cinematic hero experience
│   └── service.css                    # Styling for the luxury modal and dashboard suite
├── tests/
│   └── service.test.js                # Automated end-to-end integration tests (Node test runner)
├── index.html                         # Single-page application entry point
├── package.json                       # Scripts and project dependencies
└── vite.config.js                     # Vite bundler configuration (dev port 5175, preview port 4175)
```

---

## 3. The Frontend Visual Engine & Animations

The landing page provides a museum-grade visual experience powered by `src/main.js`:

### ⏱️ 1. Single-Entry Timer Screen
- When a user enters or reloads the website, the `#loading` screen appears.
- It calculates asset readiness and animates an analog percentage counter (`0% → 100%`) through four calibrated cinematic phases:
  - **Phase 1 (0% → 30%)**: *"ENTERING THE STUDIO"* (initial paint & Google fonts settle).
  - **Phase 2 (30% → 70%)**: *"CALIBRATING THE LIGHT"* (decoding WebP image assets via `img.decode()`).
  - **Phase 3 (70% → 95%)**: *"PREPARING THE ICON"* (preparing layers and rendering pipeline).
  - **Phase 4 (95% → 100%)**: *"ALMOST READY"* (final dramatic pause before revealing the stage).
- Once completed, `#loading` gains `.done` (`opacity: 0; pointer-events: none;`), and the timer **never reappears** during navigation; it only triggers on fresh website entry or reload.

### 🏎️ 2. The Grand Reveal Flow
- Immediately underneath the dismissed loader, the car is presented in its **fully covered** state (`target = progress = 0`).
- After a deliberate 400ms pause, the engine initiates `grandReveal()`, which executes a slow-motion, physics-eased sweep (`animateProgress(1, 4500)`) from covered sheet to glistening paint over 4.5 seconds.

### 🖼️ 3. Transition & Settle on the 3rd Image (Studio 03 — The Details)
- As soon as the reveal completes, after a 900ms cinematic linger, the engine automatically calls `setChapter(2)`.
- It smoothly fades in the 3rd image (`/assets/mustang-detail.webp`) by animating `detailProgress` to `1`.
- The UI transitions to:
  - Section Index: `03 / 03`
  - Chapter Navigator: Button `03` active
  - Headlines: `EVERY ANGLE.` / `AN ICON.`
  - Bottom Label: `STUDIO 03 — THE DETAILS`
- **Permanent State**: The experience remains parked on this 3rd image indefinitely. It will only transition if the user reloads the page or triggers **`↺ REPLAY THE REVEAL`**.

### ↺ 4. Replay Mechanics
- Clicking `↺ REPLAY THE REVEAL` disables the replay button to prevent race conditions, resets progress smoothly to `0` (re-covering the car in 700ms), executes the 4.3s reveal sweep, and upon completion smoothly returns to **Chapter 2 (the 3rd image)** and stays there once more.

---

## 4. Database Schemas & Data Modeling

All Mongoose models are located in `backend/models/index.js`:

### 1. `User` Model
```javascript
{
  username:  { type: String, required: true, trim: true, maxLength: 80 },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, select: false }, // Excluded from query results
  isAdmin:   { type: Boolean, default: false },               // Distinguishes Customer vs Admin
  phone:     { type: String, trim: true, maxLength: 20 },
  avatar:    { type: String, trim: true },
  timestamps: true // createdAt, updatedAt
}
```

### 2. `Vehicle` Model
```javascript
{
  owner:              { type: ObjectId, ref: 'User', required: true },
  registrationNumber: { type: String, required: true, unique: true, uppercase: true },
  make:               { type: String, default: 'Ford' },
  model:              { type: String, required: true },
  year:               { type: Number, min: 1900 },
  variant:            { type: String },
  vin:                { type: String, maxLength: 17 },
  purchaseDate:       { type: Date, required: true },
  mileage:            { type: Number, required: true, min: 0, default: 0 },
  fuelType:           { type: String },
  transmission:       { type: String },
  nickname:           { type: String },
  color:              { type: String },
  engineSize:         { type: String },
  timestamps: true
}
```

### 3. `ServiceCenter` Model
```javascript
{
  name:        { type: String, required: true },
  address:     { type: String, required: true },
  phone:       { type: String },
  capacity:    { type: Number, default: 10, min: 1 }, // Max active workshop bay slots
  isActive:    { type: Boolean, default: true },      // Allows closing a center temporarily
  specialties: [{ type: String }],
  timestamps: true
}
```

### 4. `ServiceRequest` Model (The Booking Pipeline)
```javascript
{
  vehicle:            { type: ObjectId, ref: 'Vehicle', required: true },
  owner:              { type: ObjectId, ref: 'User', required: true },
  serviceCenter:      { type: ObjectId, ref: 'ServiceCenter' },
  problemDescription: { type: String, required: true, maxLength: 2000 },
  preferredDate:      { type: Date, required: true },
  preferredTime:      { type: String },
  serviceType:        { type: String, default: 'General Service' },
  status:             { type: String, enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  currentStage:       { type: String, enum: ['booked', 'accepted', 'vehicle_received', 'inspection', 'in_progress', 'ready', 'completed'], default: 'booked' },
  assignedTechnician: { type: String },
  rejectionReason:    { type: String },
  cancelReason:       { type: String },
  timestamps: true
}
```

### 5. `ServiceRecord` Model (Completed Invoices)
```javascript
{
  serviceRequest:          { type: ObjectId, ref: 'ServiceRequest', required: true, unique: true },
  vehicle:                 { type: ObjectId, ref: 'Vehicle', required: true },
  invoiceNumber:           { type: String, unique: true, sparse: true }, // e.g. INV-2026-4821
  partsReplaced:           [{ name: String, cost: Number }],
  laborCost:               { type: Number, required: true, min: 0, default: 0 },
  totalCost:               { type: Number, required: true, min: 0 },
  serviceDate:             { type: Date, default: Date.now },
  serviceType:             { type: String },
  mileage:                 { type: Number, required: true, min: 0 },
  recommendedNextDate:     { type: Date },
  recommendedNextMileage:  { type: Number },
  notes:                   { type: String },
  timestamps: true
}
```

### 6. `Reminder` Model
```javascript
{
  user:         { type: ObjectId, ref: 'User', required: true },
  vehicle:      { type: ObjectId, ref: 'Vehicle', required: true },
  title:        { type: String, required: true },
  dueMileage:   { type: Number, min: 0 },
  dueDate:      { type: Date },
  priority:     { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status:       { type: String, enum: ['pending', 'snoozed', 'dismissed'], default: 'pending' },
  snoozedUntil: { type: Date },
  timestamps: true
}
```

### 7. `ProblemReport` Model
```javascript
{
  user:        { type: ObjectId, ref: 'User', required: true },
  vehicle:     { type: ObjectId, ref: 'Vehicle', required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  severity:    { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status:      { type: String, enum: ['pending', 'investigating', 'resolved'], default: 'pending' },
  resolvedAt:  { type: Date },
  timestamps: true
}
```

### 8. `Notification` Model
```javascript
{
  user:      { type: ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type:      { type: String, enum: ['booking', 'status_update', 'urgent_problem', 'reminder'], default: 'status_update' },
  read:      { type: Boolean, default: false },
  relatedId: { type: String },
  timestamps: true
}
```

---

## 5. Complete Backend & CRUD Route Reference

Every request to `/api/*` is processed through the router in `backend/routes/index.js`. Here is the exhaustive breakdown of every route:

---

### 5.1 Authentication & User Registry

#### `POST /api/users/register`
- **Access**: Public (Protected by in-memory rate limiter: max 30 attempts per 15 minutes).
- **Purpose**: Creates a new customer account.
- **Request Body**: `{ "username": "Carroll Shelby", "email": "shelby@ford.com", "password": "SuperSecretPassword123!", "phone": "+1 555-01968" }`
- **What it does**:
  1. Validates username (1–80 chars), email (regex format), password (minimum 10 chars).
  2. Hashes the password using `bcrypt.hash(password, 12)` with 12 salt rounds.
  3. Enforces `isAdmin: false` (public users can **never** register directly as admins).
  4. Generates a signed JWT containing `{ id: user._id }` valid for 7 days.
  5. Sets an `httpOnly`, `sameSite: strict` cookie named `session`.
- **Response**: `201 Created` with sanitized user profile (password omitted).

#### `POST /api/users/login`
- **Access**: Public (Rate-limited).
- **Purpose**: Verifies credentials and establishes a secure session cookie.
- **Request Body**: `{ "email": "shelby@ford.com", "password": "SuperSecretPassword123!" }`
- **What it does**:
  1. Queries user by lowercase email and explicitly includes password hash via `.select('+password')`.
  2. Compares plain password with bcrypt hash via `bcrypt.compare()`.
  3. If invalid, throws `401 Unauthorized` ("Incorrect email or password").
  4. If valid, issues signed JWT in the `session` cookie.
- **Response**: `200 OK` with user profile.

#### `POST /api/users/logout`
- **Access**: Public.
- **Purpose**: Destroys the authentication session.
- **What it does**: Clears the `session` cookie with matching path (`/`) and security flags.
- **Response**: `200 OK` `{"message": "Signed out."}`.

#### `GET /api/users/me`
- **Access**: Authenticated (`authenticate` middleware).
- **Purpose**: Retrieves the active signed-in user's profile and verifies session validity.
- **Response**: `200 OK` `{"_id": "...", "username": "...", "email": "...", "isAdmin": true/false}`.

#### `PUT /api/users/profile`
- **Access**: Authenticated.
- **Purpose**: Updates profile attributes (username, phone, avatar, email).
- **What it does**: Validates formats and uniqueness before saving to MongoDB.
- **Response**: `200 OK` with updated profile.

#### `POST /api/users/toggle-role`
- **Access**: Authenticated + **Admin Only** (`authorizeAdmin` middleware).
- **Purpose**: Allows registered administrators to toggle their active session between Administrator and Customer view to test perspectives.
- **Security Check**: Throws `403 Forbidden` if a regular customer calls this.
- **Response**: `200 OK` with toggled `isAdmin` flag.

#### `GET /api/users`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: Admin directory of all registered users in the platform.
- **What it does**: Uses MongoDB aggregation pipeline (`$group` on `Vehicle.owner`) to compute the total vehicles registered per user in real time.
- **Response**: `200 OK` `[{ "_id": "...", "username": "...", "email": "...", "isAdmin": false, "vehicleCount": 2, "createdAt": "..." }]`.

---

### 5.2 Vehicle Garage Management (CRUD)

#### `GET /api/vehicles`
- **Access**: Authenticated.
- **Purpose**: **Read** all vehicles belonging to the logged-in owner.
- **What it does**: `Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 })`.
- **Response**: `200 OK` array of vehicle documents.

#### `POST /api/vehicles`
- **Access**: Authenticated.
- **Purpose**: **Create** a new vehicle in the owner's garage.
- **Request Body**:
  ```json
  {
    "model": "1968 Ford Mustang Fastback GT 390",
    "registrationNumber": "DL-01-AB-1968",
    "purchaseDate": "2020-04-15",
    "mileage": 42000,
    "make": "Ford",
    "color": "Highland Green",
    "transmission": "4-Speed Manual",
    "engineSize": "6.4L 390 cu in V8"
  }
  ```
- **What it does**:
  1. Validates required fields; ensures `purchaseDate` is not in the future and mileage >= 0.
  2. Uppercases and trims registration number; enforces MongoDB unique index.
  3. Automatically links `owner: req.user._id`.
  4. Triggers an in-app notification: *"Vehicle Added: 1968 Ford Mustang has been registered to your garage."*
- **Response**: `201 Created` with saved vehicle document.

#### `GET /api/vehicles/:id`
- **Access**: Authenticated (Owner or Admin).
- **Purpose**: **Read** a specific vehicle's details.
- **Security**: Validates that `:id` is a valid 24-character hexadecimal ObjectId (`checkId`) and executes `ownedVehicle()`: if user is not an admin and does not own the car, throws `403 Forbidden`.
- **Response**: `200 OK` vehicle document.

#### `PUT /api/vehicles/:id`
- **Access**: Authenticated (Owner or Admin).
- **Purpose**: **Update** vehicle specifications and odometer reading.
- **What it does**:
  1. Executes ownership verification.
  2. Enforces business rule: **Odometer reading can never decrease** (`next.mileage < v.mileage` throws `400 Bad Request`).
  3. Updates and persists modifications.
- **Response**: `200 OK` with updated vehicle.

#### `DELETE /api/vehicles/:id`
- **Access**: Authenticated (Owner or Admin).
- **Purpose**: **Delete** a vehicle from the garage.
- **Business Logic & Cascade Safety**:
  - Checks if vehicle has existing `ServiceRequest` or `ServiceRecord` entries.
  - If records exist and `?cascade=true` is **not** provided: aborts with `409 Conflict` (*"Vehicles with bookings or service history cannot be deleted."*).
  - If `?cascade=true` is supplied: executes an **atomic transaction** deleting all associated service requests, records, and the vehicle document simultaneously.
- **Response**: `200 OK` `{"message": "Vehicle deleted."}`.

#### `GET /api/vehicles/:id/history`
- **Access**: Authenticated (Owner or Admin).
- **Purpose**: **Read** complete certified service record logbook for this vehicle, sorted newest first (`serviceDate: -1`).
- **Response**: `200 OK` array of `ServiceRecord` items with itemized parts lists.

#### `GET /api/vehicles/:id/reminder`
- **Access**: Authenticated (Owner or Admin).
- **Purpose**: Calculates mathematical maintenance due state.
- **Formula**:
  - Baseline is the latest `ServiceRecord.serviceDate` or fallback to `Vehicle.purchaseDate`.
  - Due Date = `baselineDate + 6 months` (configurable via `SERVICE_REMINDER_MONTHS_INTERVAL`).
  - Due Mileage = `lastRecordedMileage + 5,000 km` (configurable via `SERVICE_REMINDER_MILEAGE_INTERVAL`).
  - Flags `dueByMileage: (currentMileage >= dueMileage)` and `dueByDate: (currentDate >= dueDate)`.
- **Response**: `200 OK` `{"dueByMileage": false, "dueByDate": true, "dueDate": "...", "dueMileage": 47000}`.

---

### 5.3 Service Booking & Workflow Lifecycle

#### `POST /api/service-requests`
- **Access**: Authenticated (Owner).
- **Purpose**: **Create** a service appointment request.
- **Request Body**:
  ```json
  {
    "vehicle": "65f01...",
    "serviceCenter": "65f02...",
    "serviceType": "Engine & Dyno Tuning",
    "preferredDate": "2026-09-20",
    "preferredTime": "10:30 AM",
    "problemDescription": "Rough idle upon cold start; ignition timing inspection required."
  }
  ```
- **What it does**:
  1. Validates vehicle ownership via `ownedVehicle()`.
  2. Ensures `preferredDate` is today or a future date.
  3. Executes an **atomic database transaction**: locks vehicle document, sets `currentStage: 'booked'`, and creates an unread notification for the owner.
- **Response**: `201 Created` with booking document.

#### `GET /api/service-requests/my`
- **Access**: Authenticated.
- **Purpose**: **Read** all bookings submitted by the signed-in customer.
- **What it does**: Populates vehicle and service center details and sorts by creation date descending.
- **Response**: `200 OK` array of user requests.

#### `GET /api/service-requests`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: **Read** all bookings across the entire network for admin dispatching.
- **What it does**: Populates vehicle, owner (`username email`), and serviceCenter.
- **Response**: `200 OK` master request list.

#### `PUT /api/service-requests/:id/accept`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: Staff accepts a pending booking.
- **Request Body**: `{ "assignedTechnician": "Dave Miller (Master Tech)" }`
- **What it does**:
  1. Atomically transitions status from `pending` → `accepted` and stage → `accepted`.
  2. Rejects any request that is not currently `pending` (`409 Conflict`).
  3. Dispatches automated customer notification with technician assignment and date confirmation.
- **Response**: `200 OK` with updated request.

#### `PUT /api/service-requests/:id/reject`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: Staff declines a booking.
- **Request Body**: `{ "rejectionReason": "Bay fully booked for historic restoration." }`
- **What it does**: Transitions status to `rejected`, records rejection reason, and notifies owner.
- **Response**: `200 OK`.

#### `PUT /api/service-requests/:id/cancel`
- **Access**: Authenticated (Owner of booking or Admin).
- **Purpose**: Cancels a booking before work begins.
- **Business Guard**: Cannot cancel requests with status `completed` or `cancelled` (`409 Conflict`).
- **Response**: `200 OK` with cancellation confirmation.

#### `PUT /api/service-requests/:id/stage`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: Steps an active service job through the **Kanban Workflow Stepper**.
- **Allowed Stages**:
  - `vehicle_received` ➔ *"Vehicle Received at Center"*
  - `inspection` ➔ *"Diagnostic Inspection Underway"*
  - `in_progress` ➔ *"Work in Progress on Bay"*
  - `ready` ➔ *"Vehicle Ready for Collection"*
  - `completed` ➔ *"Service Completed"*
- **What it does**: Updates `currentStage`, adjusts status to `in_progress` or `completed`, and sends a live status update notification to the vehicle owner.
- **Response**: `200 OK`.

---

### 5.4 Certified Service Records & Invoicing (CRUD)

#### `POST /api/service-records`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: **Create** an immutable invoice and service record upon job completion.
- **Request Body**:
  ```json
  {
    "serviceRequest": "65f01...",
    "serviceType": "Major Dyno & Carburetor Tune",
    "mileage": 43500,
    "serviceDate": "2026-09-12",
    "partsReplaced": [
      { "name": "Holley 4-Barrel Carburetor Gasket Kit", "cost": 4200 },
      { "name": "Autolite Platinum Spark Plugs (Set of 8)", "cost": 3800 }
    ],
    "laborCost": 7500,
    "recommendedNextMileage": 48500,
    "recommendedNextDate": "2027-03-12",
    "notes": "Full dyno run completed. Clean 340 hp pull at 5200 RPM."
  }
  ```
- **What it does (ACID Transaction)**:
  1. Verifies that the associated `ServiceRequest` is currently in `accepted` or `in_progress` status.
  2. Ensures that this service request has **not already been invoiced** (`unique: true` constraint on `serviceRequest`).
  3. Verifies that `mileage >= vehicle.mileage` (mileage cannot roll backwards).
  4. Automatically updates `Vehicle.mileage = newMileage`.
  5. Computes `totalCost = sum(partsReplaced.cost) + laborCost`.
  6. Generates an official invoice ID: `INV-YYYY-XXXX` (e.g., `INV-2026-7812`).
  7. Transitions the `ServiceRequest` to `completed`.
  8. Dispatches an invoice notification with costs and next maintenance mileage.
- **Response**: `201 Created` with finalized record document.

#### `GET /api/service-records`
- **Access**: Authenticated (Owner or Admin).
- **Purpose**: **Read** service records. Admins see all network records; customers see their vehicles' history.
- **Response**: `200 OK` array of populated records.

#### `DELETE /api/service-records/:id`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: **Delete** an erroneous service record.
- **Response**: `200 OK` `{"message": "Service record deleted."}`.

---

### 5.5 Smart Reminders & Maintenance Schedules (CRUD)

#### `GET /api/reminders`
- **Access**: Authenticated (Customers get their own reminders; Admins view all).
- **Purpose**: **Read** active maintenance reminders sorted by due date.
- **Response**: `200 OK` array of reminders.

#### `POST /api/reminders`
- **Access**: Authenticated (Owner of the vehicle or Admin).
- **Purpose**: **Create** a custom maintenance reminder.
- **Request Body**:
  ```json
  {
    "vehicle": "65f01...",
    "title": "Holley Carburetor Float Inspection",
    "dueMileage": 45000,
    "dueDate": "2026-11-01",
    "priority": "high"
  }
  ```
- **Response**: `201 Created`.

#### `PUT /api/reminders/:id`
- **Access**: Authenticated (Owner of the reminder or Admin).
- **Purpose**: **Update** reminder status or snooze it.
- **Snooze Logic**: When `snoozeDays` (e.g. 3, 7, or 14) is provided:
  - `dueDate = currentDate + snoozeDays`
  - `status = 'snoozed'`
  - `snoozedUntil = dueDate`
- **Response**: `200 OK` with updated reminder.

#### `DELETE /api/reminders/:id`
- **Access**: Authenticated (Owner or Admin).
- **Purpose**: **Delete** / dismiss a reminder.
- **Response**: `200 OK` `{"message": "Reminder deleted."}`.

---

### 5.6 Vehicle Diagnostics & Problem Reports (CRUD)

#### `GET /api/problem-reports`
- **Access**: Authenticated (Customers see their reports; Admins see all open reports).
- **Purpose**: **Read** diagnostic problem tickets.
- **Response**: `200 OK`.

#### `POST /api/problem-reports`
- **Access**: Authenticated (Owner).
- **Purpose**: **Create** an emergency or maintenance diagnostic report.
- **Request Body**:
  ```json
  {
    "vehicle": "65f01...",
    "title": "Clutch pedal spongey & slight fluid weep",
    "description": "Noticeable lack of resistance on clutch pedal after 30 minutes of highway driving.",
    "severity": "critical" // 'low' | 'medium' | 'high' | 'critical'
  }
  ```
- **Automated Escalation**:
  - Dispatches an immediate confirmation notification to the customer.
  - If severity is **high** or **critical**, the system automatically queries all registered administrators (`User.find({ isAdmin: true })`) and broadcasts an **URGENT ISSUE** alert to every admin inbox.
- **Response**: `201 Created`.

#### `PUT /api/problem-reports/:id/resolve`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: Marks the issue as investigated and resolved by workshop staff.
- **What it does**: Sets `status: 'resolved'`, timestamps `resolvedAt: new Date()`, and alerts the vehicle owner.
- **Response**: `200 OK`.

#### `DELETE /api/problem-reports/:id`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: **Delete** closed or spam tickets.
- **Response**: `200 OK` `{"message": "Problem report deleted."}`.

---

### 5.7 Authorized Workshop Centers (CRUD)

#### `GET /api/service-centers`
- **Access**: Authenticated.
- **Purpose**: **Read** directory of authorized centers.
- **Self-Healing Seed**: If the collection is empty, automatically inserts 3 default centers:
  - *Downtown Heritage Works* (12 bays)
  - *Westside Performance Bay* (8 bays)
  - *Harbor Classic Concierge* (6 bays)
- **Response**: `200 OK`.

#### `POST /api/service-centers`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: **Create** a new workshop location.
- **Request Body**:
  ```json
  {
    "name": "Midtown Precision Restorations",
    "address": "104 Ford Expressway, Sector 4",
    "phone": "+1 (555) 018-1968",
    "capacity": 14,
    "isActive": true,
    "specialties": ["Chassis Alignment", "Engine Rebuilds", "Body Paint"]
  }
  ```
- **Response**: `201 Created`.

#### `PUT /api/service-centers/:id`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: **Update** address, capacity, phone, specialties, or toggle active status.
- **Response**: `200 OK`.

#### `DELETE /api/service-centers/:id`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: **Delete** workshop location from network.
- **Response**: `200 OK` `{"message": "Service center deleted."}`.

---

### 5.8 Financial Analytics & Executive Dashboards

#### `GET /api/dashboard/owner`
- **Access**: Authenticated Customer.
- **Purpose**: Computes metrics for the logged-in owner:
  - Total vehicles registered
  - Total historical maintenance spend (₹)
  - List of upcoming confirmed appointments
  - Recent completed service records
- **Response**: `200 OK` `{"vehicleCount": 1, "totalServiceCost": 15500, "upcomingServices": [...], "completedServices": [...]}`.

#### `GET /api/dashboard/service-center`
- **Access**: Authenticated + **Admin Only**.
- **Purpose**: Computes high-level analytics across the entire network:
  - Fleet-wide registered vehicle count
  - Gross service revenue across all completed invoices (₹)
  - Active workshop queue
  - Completed logbooks
- **Response**: `200 OK`.

---

### 5.9 Notification Center

#### `GET /api/notifications`
- **Access**: Authenticated.
- **Purpose**: Retrieves the 50 most recent notifications for the user + real-time `unreadCount`.
- **Response**: `200 OK` `{"notifications": [...], "unreadCount": 3}`.

#### `PUT /api/notifications/:id/read`
- **Access**: Authenticated.
- **Purpose**: Marks an individual notification as read.
- **Response**: `200 OK` `{"message": "Notification marked as read."}`.

#### `PUT /api/notifications/read-all`
- **Access**: Authenticated.
- **Purpose**: Marks all unread alerts as read in one click.
- **Response**: `200 OK` `{"message": "All notifications marked as read."}`.

#### `DELETE /api/notifications/:id`
- **Access**: Authenticated.
- **Purpose**: Deletes a specific notification from user's feed.
- **Response**: `200 OK`.

#### `DELETE /api/notifications`
- **Access**: Authenticated.
- **Purpose**: Clears all notifications for the user.
- **Response**: `200 OK`.

---

## 6. Security Architecture & Resilience

The platform adheres to enterprise web security principles:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 INCOMING HTTP REQUEST                  │
                  └───────────────────────────┬────────────────────────────┘
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │ 1. Origin Filter & Cache Guard                         │
                  │    • Cache-Control: no-store (Prevents token caching)  │
                  │    • Validates 'Origin' against APP_ORIGIN             │
                  │    • Rejects non-JSON mutations with 415               │
                  └───────────────────────────┬────────────────────────────┘
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │ 2. In-Memory Sliding-Window Rate Limiter               │
                  │    • Tracks requests per client IP                     │
                  │    • Limits to 30 requests/15 mins for /register,/login│
                  │    • Returns 429 Too Many Requests on breach           │
                  └───────────────────────────┬────────────────────────────┘
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │ 3. httpOnly JWT Session Cookie                         │
                  │    • Signed with 256-bit JWT_SECRET                    │
                  │    • Stored in httpOnly, SameSite:Strict cookie        │
                  │    • JavaScript cannot read token (Immune to XSS)      │
                  └───────────────────────────┬────────────────────────────┘
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │ 4. Strict Ownership Guard (ownedVehicle)               │
                  │    • Verifies String(vehicle.owner) === String(user_id)│
                  │    • Non-admins trying to access others get 403        │
                  └───────────────────────────┬────────────────────────────┘
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │ 5. ACID Database Transactions                          │
                  │    • Wrapped in mongoose.connection.transaction        │
                  │    • Locks records; guarantees zero partial state      │
                  │    • Invoicing, booking, & cascade deletes rollback    │
                  └────────────────────────────────────────────────────────┘
```

1. **XSS Immunity**: Session tokens are **never** stored in browser `localStorage` or `sessionStorage`. They are stored in an `httpOnly`, `SameSite=Strict` cookie that scripts cannot inspect.
2. **CSRF Barrier**: Any state-mutating request (`POST`, `PUT`, `PATCH`, `DELETE`) is inspected by `app.use('/api', ...)`:
   - Validates that the request `Origin` matches the whitelist (`APP_ORIGIN`).
   - Verifies `Content-Type: application/json` to prevent simple-form CSRF submissions.
3. **Password Security**: Passwords require at least 10 characters and are hashed using `bcryptjs` with 12 rounds of salting.
4. **Injection Protection**: Mongoose models enforce type-casting, length constraints, and sanitization (`trim`, regex, enum validations). Raw string concatenation in queries is strictly avoided.
5. **ACID Transactions**: Financial records and booking stage completions execute inside `mongoose.connection.transaction(async session => { ... })`. If any sub-step fails (such as mileage validation), all database writes rollback atomically.

---

## 7. Customer vs Administrator Role Isolation

A fundamental requirement of the platform is strict separation of concerns between standard owners and workshop administrators:

| Feature / Action | 👤 Customer (`isAdmin: false`) | 🛡️ Registered Admin (`isAdmin: true`) |
| :--- | :--- | :--- |
| **Header Role Switcher** | **Hidden** (Shows static `👤 Customer` badge) | **Visible** (`[ 👤 Customer ]` ⇄ `[ 🛡️ Admin ]`) |
| **Available Navigation Tabs** | 6 Tabs (`Garage`, `Book`, `History`, `Reminders`, `Problems`, `Profile`) | 9 Modules (`Overview`, `Requests`, `Active`, `Records`, `Analytics`, `Centers`, `Users`, `Heritage`, `Problems`) |
| **Vehicle Fleet Access** | Can only view, edit, or delete their own vehicles | Can inspect any vehicle across the network |
| **Booking Approvals** | Can only submit requests and cancel their own | Can Accept, Reject, Assign Technicians, and advance Kanban stages |
| **Invoicing & Billing** | Can view completed receipts and print invoices | Can generate invoices, log parts & labor, and complete records |
| **Service Centers** | Can view active centers to select for appointments | Can add new centers, edit bay capacities, and toggle operational status |
| **Diagnostic Reports** | Can report problems for their registered cars | Can review all reports, resolve issues, and receive urgent critical alerts |
| **User Directory** | No access (`403 Forbidden` on `/api/users`) | Full access to directory with vehicle fleet counts |

---

## 8. Mentor Defense Q&A Cheat Sheet

Use these exact answers when your mentor or examiner asks questions during project evaluation:

### Q1: "Why did you use HTTP-only cookies instead of storing JWT in localStorage?"
> **Answer**:  
> *"Storing JWTs in `localStorage` makes them vulnerable to Cross-Site Scripting (XSS). If any malicious script runs on the client, it can read `localStorage.getItem('token')` and hijack the account. By placing the JWT in an `httpOnly`, `SameSite: Strict` cookie, browser JavaScript is physically barred from accessing the token, eliminating token theft via XSS while `SameSite: Strict` protects against CSRF."*

### Q2: "How do you prevent one user from editing or deleting another user's car?"
> **Answer**:  
> *"We built a centralized middleware helper called `ownedVehicle(vehicleId, user)`. It queries the vehicle from MongoDB and performs an explicit ownership check: `String(vehicle.owner) !== String(user._id)`. If the logged-in user is not an administrator and does not own the vehicle, the server throws an immediate `403 Forbidden` error. This guarantees database-level isolation even if someone tampers with the frontend."*

### Q3: "What happens if a server crashes while creating an invoice and updating mileage?"
> **Answer**:  
> *"We use MongoDB ACID transactions via `await mongoose.connection.transaction(async session => { ... })`. Inside this transaction, updating the vehicle's odometer, transitioning the service request to completed, generating the invoice record, and creating the notification are committed together. If any failure occurs midway, the transaction automatically rolls back, leaving no orphaned or corrupt data."*

### Q4: "Why do you prevent a vehicle from being deleted if it has service history?"
> **Answer**:  
> *"For automotive and financial integrity, deleting a vehicle that has existing service history would orphan legal invoices (`INV-YYYY-XXXX`). Therefore, our `DELETE /api/vehicles/:id` route checks for existing records and throws a `409 Conflict` by default. To delete, an explicit `?cascade=true` flag must be passed, which executes a transaction deleting all child records safely."*

### Q5: "How does the cinematic reveal slider and loading timer work?"
> **Answer**:  
> *"The visual engine uses an orchestrated sequence in `src/main.js`. On entry, an asynchronous function `animateCounter()` animates the loading bar from 0% to 100% while verifying image decoding via `img.decode()`. Once ready, the loading overlay fades, presenting the vehicle in a covered state. An easing sweep `animateProgress(1, 4500)` uncovers the car over 4.5 seconds. After lingering for 900ms, it automatically transitions to Chapter 2 (the 3rd image: Studio 03 — The Details) and stays there permanently until page reload or clicking Replay."*

### Q6: "How do you enforce role isolation between customers and admins?"
> **Answer**:  
> *"We employ defense-in-depth:  
> 1. **UI Layer**: The customer interface hides the admin switch pill and renders only customer-accessible tabs.  
> 2. **API Layer**: Every sensitive route is guarded by `authorizeAdmin` middleware (`if (!req.user.isAdmin) throw 403`).  
> 3. **Database Layer**: Registration explicitly hardcodes `isAdmin: false`, preventing users from escalating privileges during signup."*

---

## 9. Installation, Environment & Execution

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas Cluster or local MongoDB instance supporting replica sets (for transactions).

### 1. Environment Configuration (`.env`)
Create a `.env` file in the root directory:
```env
# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
DB_NAME=caranimation_service

# Security Secrets
JWT_SECRET=super_secret_jwt_key_that_is_at_least_32_characters_long_1968

# Network Configuration
PORT=5001
APP_ORIGIN=http://127.0.0.1:5175,http://localhost:5175

# Maintenance Defaults
SERVICE_REMINDER_MILEAGE_INTERVAL=5000
SERVICE_REMINDER_MONTHS_INTERVAL=6
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Creating the Initial Master Administrator
Because public signup registers customers only, seed an administrator account via CLI:
```bash
ADMIN_NAME="Master Admin" ADMIN_EMAIL="admin@ford.example" ADMIN_PASSWORD="MasterPassword1968!" npm run create-admin
```

### 4. Running the Development Environment
Run both backend API (Port 5001) and frontend Vite server (Port 5175) concurrently:
```bash
npm run dev
```
Or start them in separate terminal windows:
- **Backend API Server**: `npm run server` (Serves on `http://127.0.0.1:5001`)
- **Frontend Client**: `npm run client` (Serves on `http://127.0.0.1:5175`)

### 5. Running Automated Integration Tests
Execute the end-to-end test suite (spawns an isolated temporary test database, tests full auth, garage CRUD, booking lifecycle, invoicing transactions, and teardown):
```bash
npm test
```

### 6. Production Build
```bash
npm run build
npm run preview
```

---

### 🏁 Summary of Verified Capabilities
- ✅ **Cinematic Presentation**: Single-entry loading timer (0% → 100%), automatic slow-motion grand reveal, and permanent landing on the 3rd image (`STUDIO 03 — THE DETAILS`).
- ✅ **Full Garage CRUD**: Add cars, update mileage, view service history, and calculate maintenance schedules.
- ✅ **Complete Booking Lifecycle**: Book appointments, assign master technicians, advance through the 5-stage Kanban stepper, and cancel bookings.
- ✅ **Financial Invoicing**: Snapshots parts costs, labor costs, updates vehicle mileage, and prints luxury receipts.
- ✅ **Strict Security & RBAC**: `httpOnly` JWT cookies, CSRF Origin validation, IP rate limiting, and zero customer-to-admin leakage.
- ✅ **100% Automated Test Coverage**: Integration tests passing with zero failures.
