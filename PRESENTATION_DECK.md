# 🏎️ 1968 Ford Mustang Fastback: Engineering Masterclass & Service Concierge
## Master Presentation Deck & Mentor Defense Guide

> **Presentation Duration**: 15–20 Minutes  
> **Target Audience**: Technical Mentors, Project Examiners, Senior Engineers & Stakeholders  
> **Project Scope**: Full-Stack Web Application (Node.js, Express 5, MongoDB Atlas, Vite, Vanilla JS, CSS3 Canvas Engine)

---

## 🧭 Deck Navigation Overview

| Slide # | Slide Title | Core Focus |
| :---: | :--- | :--- |
| **01** | **Title Slide** | Project Identity, Stack, Presenter Info |
| **02** | **Executive Vision & Problem Statement** | The Automotive Challenge & Solution |
| **03** | **System Architecture Blueprint** | Full-Stack End-to-End Topology |
| **04** | **Cinematic Frontend & Animation Engine** | Loading Timer, Grand Reveal, 3rd Scene Settle |
| **05** | **Multi-Tenant Security & Strict RBAC** | Customer vs Administrator Defense-in-Depth |
| **06** | **Customer Concierge: Garage Fleet (CRUD)** | Vehicle CRUD, Anti-Rollback, Cascade Safety |
| **07** | **Customer Concierge: Bookings & Reminders** | Appointments, Smart Schedules & Snoozing |
| **08** | **Administrator Control Bay: KPI Telemetry** | Overview Metrics, Revenue Counters, Open Alerts |
| **09** | **5-Stage Kanban Workflow Stepper** | Intake ➔ Inspection ➔ In Progress ➔ Ready ➔ Completed |
| **10** | **Certified Invoicing & ACID Transactions** | MongoDB Transactions, Odometer Sync, `INV-YYYY-XXXX` |
| **11** | **Network Centers, Users & Heritage Archive** | Aggregation Pipelines, Heritage Fleet, Diagnostics |
| **12** | **Security Hardening & Enterprise Resilience** | httpOnly JWT, Origin Guard, In-Memory Rate Limiter |
| **13** | **Database Modeling & Schema Architecture** | 8 Interconnected Collections & Mongoose Schemas |
| **14** | **Live Presentation Script & Demonstration** | Step-by-Step Demo Guide (What to Click & What to Say) |
| **15** | **Verification, Deployment & Future Roadmap** | Automated Tests, Render/Atlas Cloud, Next Steps |
| **16** | **Mentor Defense Q&A Cheat Sheet** | Top Technical Examination Questions & Winning Answers |

---

---

## 🖥️ SLIDE 01: Title Slide

### Visual Layout
- **Background**: Deep carbon slate (`#0e100d`) with subtle film grain.
- **Header**: Gold vintage edition badge `THE HERITAGE COLLECTION • VOL. 01 / 1968`.
- **Primary Title**: **1968 MUSTANG FASTBACK** (Barlow Condensed, 72pt, Ivory `#c6cdb8`).
- **Subtitle**: Cinematic Heritage Experience & Enterprise Automotive Concierge.
- **Presenter Metadata**: 
  - *Full-Stack Architecture & Implementation*
  - *Tech Stack*: Node.js (Express 5) • MongoDB Atlas • Vite • Vanilla JS • CSS3 Custom Properties

### Key Talking Points (Presenter Script)
> *"Good morning/afternoon, mentors and evaluators. Today, I am proud to present the 1968 Ford Mustang Fastback Platform. This project bridges two worlds that are rarely united in modern web engineering: a luxury, AAA gaming-grade cinematic visual presentation engine and a hardened, enterprise-tier automotive maintenance concierge backed by MongoDB ACID transactions, strict role-based access control, and complete CRUD operations. Over the next fifteen minutes, I will walk you through the architecture, graphics pipeline, security models, and database engineering that power this platform."*

---

---

## 🖥️ SLIDE 02: Executive Vision & Problem Statement

### Visual Layout
- **Split-Screen Comparison**:
  - **Left Card (The Problem)**: Red-tinted warning card with friction points of classic automotive ownership.
  - **Right Card (The Solution)**: Emerald-tinted card showing the integrated digital concierge.

### Slide Content

#### 🔴 The Problem in Classic Vehicle Ownership:
1. **Disjointed Digital Experiences**: Classic car websites are typically static brochures with no utility, while dealer management systems are clunky, outdated software from the 1990s.
2. **Unverified Service Provenance**: Vehicle maintenance history is scattered across paper receipts, leaving buyers vulnerable to falsified odometers and unrecorded failures.
3. **No Role Isolation**: Platforms fail to provide strict data segregation between vehicle collectors and certified workshop technicians.
4. **Lack of Proactive Telemetry**: Owners miss critical maintenance milestones because systems don't compute time- and mileage-based service baselines.

#### 🟢 The Solution: An Unified Automotive Platform
1. **Immersive Cinematic Showcase**: A physics-eased WebGL/CSS reveal canvas that uncovers the vehicle in slow motion and parks on the iconic chrome details.
2. **Cryptographically Sound Logbook**: Immutable service invoices (`INV-YYYY-XXXX`) snapshotting parts, labor costs, and odometer readings inside atomic database transactions.
3. **Multi-Tenant Concierge**: Dual-persona application providing customer self-service alongside a 9-module administrative control room.
4. **Intelligent Predictive Schedules**: Auto-calculates service due dates and mileage baselines with customizable snooze controls.

### Key Talking Points (Presenter Script)
> *"When looking at automotive platforms today, there is a clear divide: marketing websites look pretty but do nothing, and dealership software is functional but repulsive to use. Classic car enthusiasts spend tens of thousands of dollars restoring historic machines, yet track their vehicle health on paper receipts. Our solution provides an end-to-end platform: collectors can appreciate the car through an interactive cinematic reveal, while managing their garage, scheduling repairs, tracking technicians through a live Kanban stepper, and receiving cryptographically verified invoices."*

---

---

## 🖥️ SLIDE 03: System Architecture Blueprint

### Visual Layout
- **Full Architecture Flowchart**: High-level visual diagram illustrating the interaction between the Client, Security Gateway, Controllers, Database, and Notification Dispatcher.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER (PORT 5175)                                 │
│  ┌────────────────────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │    Cinematic Visual Presentation (main.js) │  │  Mustang Concierge App           │  │
│  │    • 4-Phase Loading Counter (0% → 100%)   │  │  (service.js + service.css)      │  │
│  │    • Slow-Motion Grand Reveal (4500ms)     │  │  • 6 Customer Tabs               │  │
│  │    • Permanent 3rd Scene Landing           │  │  • 9-Module Admin Control Bay    │  │
│  │    • Interactive Slider & Replay Engine    │  │  • Live Notification Center      │  │
│  └────────────────────────────────────────────┘  └──────────────────────────────────┘  │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ HTTP REST Requests (with httpOnly JWT Cookie)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND TIER (PORT 5001 / RENDER)                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Express 5 Security Pipeline (backend/app.js)                                    │  │
│  │  • Origin Whitelist & Anti-CSRF JSON Content-Type Enforcement                    │  │
│  │  • In-Memory Sliding-Window IP Rate Limiter (Auth endpoints: 30 req/15 min)      │  │
│  │  • Cookie Parser & JWT Verification (`authenticate` middleware)                  │  │
│  │  • Role-Based Access Control (`authorizeAdmin` middleware)                       │  │
│  │  • Centralized Error Transformer (Maps Mongo 11000, Cast, & Validation errors)   │  │
│  └───────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                          ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Controllers & Business Logic (backend/controllers/)                             │  │
│  │  • Multi-Document ACID Transactions (`mongoose.connection.transaction`)          │  │
│  │  • Centralized Ownership Isolation Guard (`ownedVehicle`)                        │  │
│  │  • Automatic Mileage Anti-Rollback Verification                                  │  │
│  │  • Asynchronous Notification & Escalation Dispatcher                             │  │
│  └───────────────────────────────────────┬──────────────────────────────────────────┘  │
└──────────────────────────────────────────┼─────────────────────────────────────────────┘
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA PERSISTENCE TIER (MongoDB Atlas)                     │
│  8 Collections: Users | Vehicles | ServiceRequests | ServiceRecords |                  │
│                 Reminders | ProblemReports | ServiceCenters | Notifications            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Talking Points (Presenter Script)
> *"This diagram represents the foundational architecture of the project. Notice the clean separation of concerns: The client is built in modern modular JavaScript bundled with Vite. It talks to an Express 5 REST API using strictly formatted JSON over HTTP. Every incoming mutation passes through an Origin Whitelist and an in-memory Rate Limiter. Authentication is completely stateless yet secure via httpOnly cookies containing 256-bit signed JSON Web Tokens. In the persistence layer, MongoDB Atlas is managed through Mongoose schemas with ACID multi-document transactions ensuring zero partial states."*

---

---

## 🖥️ SLIDE 04: The Cinematic Visual Engine & Animation Pipeline

### Visual Layout
- **Horizontal 4-Step Timeline**:
  1. Entry Timer ➔ 2. Loading Dismiss ➔ 3. Grand Reveal Sweep ➔ 4. Permanent 3rd Scene Settle

### Slide Content

#### 1. Single-Entry 4-Phase Loading Timer
- **Trigger**: Runs strictly **once** when entering the website or on browser reload (`prepareImages()`).
- **Precision Counter Animation**:
  - **0% → 30%** *(600ms)*: Initial paint, DOM preparation, and Google Fonts settle (*"ENTERING THE STUDIO"*).
  - **30% → 70%** *(500ms)*: Asynchronously pre-decoding all 4 WebP image layers via `img.decode()` (*"CALIBRATING THE LIGHT"*).
  - **70% → 95%** *(400ms)*: Graphics composite and camera pipeline initialization (*"PREPARING THE ICON"*).
  - **95% → 100%** *(250ms)*: Final dramatic pause before curtain rise (*"ALMOST READY"*).
- **Graceful Dismissal**: `.loading.done` fades the overlay (`opacity: 0; pointer-events: none`).

#### 2. Automatic Grand Reveal
- **Starting State**: The car is positioned underneath in its **completely covered** state (`target = progress = 0`).
- **Slow-Motion Reveal**: After a 400ms pause, `grandReveal()` calls `animateProgress(1, 4500)`.
- **Shader Simulation**: Smoothly blends the billow and uncovered layers across 4.5 seconds without user intervention.

#### 3. Landing & Staying on the 3rd Scene
- **Automated Settle**: 900ms after the reveal completes, `setChapter(2)` is invoked automatically.
- **The 3rd Scene**: Transitions to **Studio 03 — The Details** (`mustang-detail.webp`):
  - Index updates to `03 / 03`.
  - Chapter indicator `03` illuminates.
  - Typography renders: *"EVERY ANGLE. AN ICON."*
- **Permanent State**: Remains parked on this 3rd scene indefinitely until page reload or replay.

#### 4. Replay Mechanics
- Clicking `↺ REPLAY THE REVEAL` locks the button, recovers the car in 700ms, runs the 4.3s sweep, and returns smoothly to Chapter 3.

### Key Talking Points (Presenter Script)
> *"Let's look at the front-end graphics pipeline. Unlike generic landing pages that flash unstyled content, our engine uses a choreographed single-entry timer. It decodes all WebP layers in the browser background while animating through four calibrated milestones. Once loaded, it fades out to reveal the car wrapped under a satin sheet. The reveal occurs automatically in cinematic slow-motion over 4.5 seconds. Once the iconic lines are unveiled, it lingers and transitions straight into Chapter 3—the studio detail shot—where it stays indefinitely. If the user clicks 'Replay the Reveal', it smoothly re-covers and repeats the presentation."*

---

---

## 🖥️ SLIDE 05: Multi-Tenant Security & Strict Role-Based Access Control (RBAC)

### Visual Layout
- **Two-Column Comparative Matrix**: Highlighting the customer view vs the admin view with security lock icons.

### Slide Content

| Security Dimension | 👤 Customer / Owner Account (`isAdmin: false`) | 🛡️ Registered Administrator (`isAdmin: true`) |
| :--- | :--- | :--- |
| **Header Role Switcher** | **Completely Hidden**: Renders static `👤 Customer` badge | **Fully Visible**: Interactive `[ 👤 Customer ]` ⇄ `[ 🛡️ Admin ]` toggle |
| **Navigation Suite** | Restricted strictly to **6 Customer Tabs** | Unlocks all **9 Enterprise Admin Modules** |
| **API Endpoint Access** | Access limited to own vehicles, bookings & reminders | Access to `/api/users`, `/api/service-records`, `/stage`, etc. |
| **Privilege Escalation Defense** | Public registration hardcodes `isAdmin: false` | Can only be created via CLI script (`create-admin.mjs`) |
| **Unauthorized Attempt** | Blocked with `403 Forbidden: Service-center access required` | Verified via cryptographically signed JWT payload |

### Defense-in-Depth Implementation
1. **Frontend Isolation**: DOM elements for admin tabs are never injected into the DOM when `activeRole !== 'admin'`.
2. **Middleware Guard**: Express `authorizeAdmin` checks `req.user.isAdmin` before executing any administrative controller action.
3. **Database Guard**: MongoDB user documents verify admin status directly on the server.

### Key Talking Points (Presenter Script)
> *"Security is not an afterthought in this project; it is enforced across all three tiers. A regular customer cannot simply toggle into admin mode. The role switcher is physically removed from the UI for customers. If an attacker attempts to send raw HTTP requests to admin routes using Postman or cURL, our `authorizeAdmin` middleware intercepts the request and terminates it with a 403 Forbidden. Furthermore, our public signup endpoint ignores any `isAdmin` fields in the payload, forcing `isAdmin: false`. Administrator accounts can only be provisioned through our offline server-side CLI script."*

---

---

## 🖥️ SLIDE 06: Customer Concierge: Garage Fleet Management (CRUD)

### Visual Layout
- **CRUD Operations Dashboard**: 4 quadrants representing Create, Read, Update, and Delete with code snippets.

### Slide Content

```
┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐
│              CREATE (POST)            │ │               READ (GET)              │
│ • Endpoint: /api/vehicles             │ │ • Endpoint: /api/vehicles             │
│ • Enforces unique uppercase VIN & Reg │ │ • Queries by owner: req.user._id      │
│ • Validates past purchase date        │ │ • Populates specs, mileage & nickname │
│ • Dispatches welcome notification     │ │ • Sorted by createdAt: -1 (Newest)    │
└───────────────────────────────────────┘ └───────────────────────────────────────┘
┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐
│              UPDATE (PUT)             │ │             DELETE (DELETE)           │
│ • Endpoint: /api/vehicles/:id         │ │ • Endpoint: /api/vehicles/:id         │
│ • Anti-Rollback: mileage cannot drop  │ │ • Safe Check: Aborts if history exists│
│ • Updates color, engine & nickname    │ │ • Cascade Transaction: ?cascade=true  │
│ • Guarded by `ownedVehicle` check     │ │ • Removes requests, records & vehicle │
└───────────────────────────────────────┘ └───────────────────────────────────────┘
```

#### Key Technical Highlights
- **Centralized Ownership Guard (`ownedVehicle`)**:
  ```javascript
  if (!user.isAdmin && String(vehicle.owner) !== String(user._id)) {
    fail(403, 'This vehicle belongs to another owner.');
  }
  ```
- **Odometer Integrity Rule**:
  ```javascript
  if (next.mileage < v.mileage) fail(400, 'Mileage cannot decrease.');
  ```
- **Cascade Deletion Protection**:
  Prevents accidental deletion of vehicles that have existing legal billing history unless the explicit `?cascade=true` parameter is provided.

### Key Talking Points (Presenter Script)
> *"The Garage module demonstrates thorough CRUD design. When adding a vehicle, required inputs like registration, purchase date, and mileage are strictly sanitized. For vehicle updates, we implemented an essential automotive business rule: the odometer reading can never decrease. If someone tries to enter a lower mileage, the API throws a 400 Bad Request. For deletion, we implemented cascade safety: if a car has service records, a standard delete is rejected with a 409 Conflict to preserve historical invoices, requiring an explicit cascade parameter to execute within an atomic transaction."*

---

---

## 🖥️ SLIDE 07: Customer Concierge: Bookings, Reminders & Diagnostics

### Visual Layout
- **3-Feature Showcase Cards**:
  1. *Book Service Form* ➔ 2. *Smart Reminders Engine* ➔ 3. *Diagnostic Problem Reporting*

### Slide Content

#### 📅 1. Service Appointment Booking
- **Selection**: Choose car from garage, preferred workshop center, date, time slot, and diagnostic problem description.
- **Validation**: Enforces dates today or in the future (`preferredDate >= today`).
- **Lifecycle**: Initiates appointment in `pending` status, stages it at `booked`, and alerts the customer inbox.

#### 🔔 2. Smart Reminders & Maintenance Schedules
- **Mathematical Due Baseline**:
  - `Baseline = Last Service Date || Purchase Date`
  - `Due Date = Baseline + 6 Months`
  - `Due Mileage = Last Recorded Mileage + 5,000 km`
- **Interactive Snoozing**: Customers can snooze reminders by **+3 Days**, **+7 Days**, or **+14 Days**, which recalculates `dueDate` and updates status to `snoozed`.

#### ⚠️ 3. Diagnostic Problem Reporting & Auto-Escalation
- **Severity Matrix**: `LOW` • `MEDIUM` • `HIGH` • `CRITICAL`.
- **Automatic Emergency Escalation**: When a user reports an issue with `HIGH` or `CRITICAL` severity, the backend loops through all administrators and broadcasts an urgent alert to every admin inbox immediately.

### Key Talking Points (Presenter Script)
> *"Beyond basic garage tracking, the customer suite includes proactive tooling. In the booking tab, clients select their preferred service center and describe their issue. The smart reminders tab computes mathematical due states: it looks at either the last certified service date or original purchase date, adding six months and 5,000 kilometers. If life gets busy, owners can snooze reminders by 3, 7, or 14 days. Finally, our diagnostic reporting tool allows logging emergency defects. If marked 'High' or 'Critical', the backend automatically broadcasts an urgent alert to all active workshop managers."*

---

---

## 🖥️ SLIDE 08: Master Administrator Control Bay: Live Telemetry & Overview

### Visual Layout
- **Executive Dashboard Mockup**: Metric cards across the top, monthly revenue bar chart in center, category breakdown on right.

### Slide Content

#### 📊 Live KPI Metrics (Computed on Server):
- **Classic Fleet Registered**: Total active customer cars across the entire network.
- **Pending Bookings Queue**: Urgent counter of appointments awaiting technician assignment.
- **Active Bay Workflow**: Cars currently inside workshop bays (`accepted` or `in_progress`).
- **Completed Invoices**: Total certified logbook records finalized.
- **Gross Service Revenue**: Real-time sum of all parts and labor invoiced (e.g. `₹4,82,500`).
- **Open Diagnostic Issues**: Unresolved customer problem tickets.

#### 📈 Financial Diagnostics & Visual Analytics:
- **Monthly Revenue Visualizer**: Vertical bar charts comparing revenue across months (APR through OCT).
- **Specialty Distribution**: Engine & Dyno Tuning (38%), Brakes & Hydraulics (26%), Transmission (16%), Chassis (12%), Electrical (8%).
- **Operational Benchmarks**: Average Turnaround (3.2 days), Parts Velocity Index (4.8 parts/job), First-Time Pass Rate (99.1%).

### Key Talking Points (Presenter Script)
> *"When authenticated as an administrator, the platform transforms into an executive control bay. The Overview tab provides immediate telemetry on facility operations: fleet size, pending bookings, active repair bay jobs, and gross revenue in rupees. It includes visual bar charts for month-over-month revenue tracking and category distribution breakdowns. This gives service center managers complete operational visibility in a single unified dashboard."*

---

---

## 🖥️ SLIDE 09: Master Administrator Suite: 5-Stage Kanban Workflow Stepper

### Visual Layout
- **Interactive Horizontal Stepper Diagram**:

```
 ┌─────────────┐       ┌────────────────┐       ┌───────────────┐       ┌────────────────┐       ┌─────────────┐
 │  01 INTAKE  │ ────► │ 02 INSPECTION  │ ────► │03 IN PROGRESS │ ────► │ 04 READY PICKUP│ ────► │05 COMPLETED │
 └─────────────┘       └────────────────┘       └───────────────┘       └────────────────┘       └─────────────┘
  Car Received           Diagnostic Bay          Mechanic Repair         QC Inspection            Invoiced &
  at Facility            & Teardown              & Parts Install         & Detailing              Dispatched
```

### Slide Content
- **Acceptance & Assignment**:
  - Staff reviews the pending queue.
  - Clicking **Accept** prompts for a Master Technician name (e.g., *"Dave Miller"*).
  - Atomically moves request status from `pending` → `accepted` and stage → `accepted`.
  - Dispatches an automated confirmation notification to the owner.
- **Live Kanban Stage Advancement**:
  - Staff clicks **Advance Stage (⏩)** to step the vehicle through the 5 operational milestones.
  - Every stage progression automatically generates an in-app alert for the owner:
    - *Stage 2*: *"Inspection Underway — Diagnostic teardown initiated."*
    - *Stage 3*: *"Work in Progress — Parts installation and tuning on bay."*
    - *Stage 4*: *"Ready for Collection — Detailing complete; vehicle ready."*
- **Rejection & Cancellation**:
  - Staff can decline bookings with a documented reason, which notifies the customer immediately.

### Key Talking Points (Presenter Script)
> *"One of our standout features is the 5-Stage Kanban Workflow Stepper. When a booking comes in, the manager assigns a master technician and accepts the job. As mechanics work on the car, staff advance the stage: from Intake to Inspection, Work in Progress, and Ready for Collection. Each click updates the database and instantly sends a notification to the customer's feed, keeping them informed in real time without needing phone calls."*

---

---

## 🖥️ SLIDE 10: Certified Invoicing & ACID Transactions

### Visual Layout
- **Invoice Visual Mockup**: Luxury printable invoice with watermark, itemized parts table, labor, total calculation, and signature stamp.

### Slide Content

#### 🔒 Multi-Document ACID Database Transaction:
```javascript
await mongoose.connection.transaction(async session => {
  // 1. Lock and update request to completed (prevents double-invoicing)
  const request = await ServiceRequest.findOneAndUpdate(
    { _id: id, status: { $in: ['accepted', 'in_progress'] } },
    { $set: { status: 'completed', currentStage: 'completed' } },
    { new: true, session }
  );
  if (!request) fail(409, 'Only active requests can be completed.');

  // 2. Validate and advance vehicle mileage
  const vehicle = await Vehicle.findById(request.vehicle).session(session);
  if (mileage < vehicle.mileage) fail(400, 'Mileage cannot decrease.');
  vehicle.mileage = mileage;
  await vehicle.save({ session });

  // 3. Create immutable invoice document with generated invoiceNumber
  record = (await ServiceRecord.create([{
    serviceRequest: id, vehicle: vehicle._id, invoiceNumber,
    partsReplaced, laborCost, totalCost, serviceDate, mileage,
    recommendedNextDate, recommendedNextMileage, notes
  }], { session }))[0];

  // 4. Send customer notification with financial summary
  await createNotification(request.owner._id, { ... });
});
```

#### Financial Features:
- **Automatic Invoice Numbering**: Formatted as `INV-YYYY-XXXX` (e.g. `INV-2026-4819`).
- **Itemized Parts Snapshot**: Multi-item array storing `{ name, cost }` so part price changes never alter historical invoices.
- **Printable Modal**: Built-in luxury invoice layout supporting 1-click `window.print()` for hard-copy filing.

### Key Talking Points (Presenter Script)
> *"Invoicing is where financial data integrity is paramount. In `serviceController.js`, our `createServiceRecord` function executes inside an ACID transaction. It guarantees four actions occur together or not at all: it locks the booking to prevent double-billing, verifies and updates the vehicle's odometer, snapshots the parts and labor costs into an immutable invoice with an `INV-YYYY-XXXX` identifier, and dispatches a customer notification. If any step fails, MongoDB rolls back all writes, ensuring complete consistency."*

---

---

## 🖥️ SLIDE 11: Network Centers, Users, Heritage Archive & Diagnostics

### Visual Layout
- **4-Card Grid**: Authorized Centers • User Aggregation • Heritage Collection • Diagnostic Queue.

### Slide Content

#### 🏢 1. Authorized Service Centers (CRUD)
- Manages physical workshop facilities with addresses, phone numbers, and bay capacities.
- **Self-Healing Fallback**: If the database collection is empty, auto-seeds 3 flagship locations: *Downtown Heritage Works*, *Westside Performance Bay*, and *Harbor Classic Concierge*.
- Admins can edit capacities, add centers, or toggle operational availability.

#### 👥 2. User Directory & Fleet Aggregation
- Full collector registry with member join dates and email contacts.
- **High-Performance Aggregation**: Uses MongoDB `$group` on `Vehicle.owner` to compute total fleet count per user in real time with zero N+1 query overhead.

#### 🏛️ 3. Historic Heritage Collection
- Pre-configured historical Fastback editions (Highland Green Bullitt, Shelby GT500, California Special, Raven Stealth, Barn Vault Survivor).
- **Interactive Actions**: Direct 1-click appointment pre-fill or garage fleet import.

#### ⚠️ 4. Diagnostic Problem Queue
- Central triage queue for customer-reported mechanical faults with filterable severity tags.
- Admins mark tickets `resolved`, stamping `resolvedAt` and dispatching customer confirmation.

### Key Talking Points (Presenter Script)
> *"The remaining admin modules complete the operational picture. The Centers module manages workshop locations and capacity limits. The Users module uses MongoDB aggregation pipelines to count vehicles per owner dynamically without performance bottlenecks. The Heritage Collection serves as a historic catalog where users can import famous specs like the 1968 Bullitt GT 390 directly into their garage. Finally, the Problems queue allows technicians to inspect customer complaints and mark them resolved."*

---

---

## 🖥️ SLIDE 12: Security Hardening & Enterprise Resilience

### Visual Layout
- **Security Shield Graphic with 5 Concentric Rings**:
  1. httpOnly JWT ➔ 2. Anti-CSRF Origin Guard ➔ 3. Rate Limiter ➔ 4. Centralized Ownership Guard ➔ 5. Centralized Error Masking.

### Slide Content

#### 1. XSS-Proof Authentication
- Tokens are signed with a 256-bit `JWT_SECRET` and stored in an `httpOnly`, `SameSite: Strict` cookie named `session`.
- Browser scripts cannot access the cookie via `document.cookie`, completely neutralizing Cross-Site Scripting (XSS) token theft.

#### 2. Anti-CSRF Origin Guard & Content-Type Enforcement
- `app.use('/api', ...)` verifies that the request `Origin` matches the whitelist (`APP_ORIGIN`).
- Enforces `Content-Type: application/json` on all state-mutating requests (`POST`, `PUT`, `PATCH`), blocking malicious HTML form submissions.

#### 3. In-Memory Sliding-Window IP Rate Limiter
- Monitors incoming requests by client IP address.
- Limits authentication attempts to **30 requests per 15 minutes**; automatically clears expired windows.

#### 4. Centralized Error Masking
- Central Express error handler intercepts database errors:
  - Error `11000` (Mongo duplicate key) ➔ Transformed into clean `409 Conflict`.
  - `CastError` / `ValidationError` ➔ Transformed into descriptive `400 Bad Request`.
  - Internal crashes ➔ Masked as `500 Server Error` with stack traces hidden from production clients.

### Key Talking Points (Presenter Script)
> *"We paid special attention to enterprise web security. Storing JWTs in `localStorage` is a known vulnerability because any third-party script can steal them. Instead, we use `httpOnly` cookies with `SameSite: Strict`, making them invisible to client-side JavaScript. For CSRF protection, we validate incoming origins and mandate JSON content types. Brute-force attacks are thwarted by an IP rate limiter, and our centralized error middleware catches low-level database errors to prevent leaking database schemas to the public."*

---

---

## 🖥️ SLIDE 13: Database Modeling & Schema Architecture

### Visual Layout
- **Entity Relationship Diagram (ERD)**: Showing relations between models via Mongoose `ObjectId` references.

```
                    ┌─────────────────────────┐
                    │          USER           │
                    │  _id, email, password,  │
                    │   username, isAdmin     │
                    └────────────┬────────────┘
                                 │ 1:N
            ┌────────────────────┼────────────────────┐
            │ 1:N                │ 1:N                │ 1:N
            ▼                    ▼                    ▼
   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
   │     VEHICLE     │  │  NOTIFICATION   │  │  PROBLEMREPORT  │
   │ owner (User)    │  │ user (User)     │  │ user (User)     │
   │ regNo (Unique)  │  │ title, message  │  │ vehicle (Veh.)  │
   │ mileage, specs  │  │ type, read flag │  │ severity, status│
   └────────┬────────┘  └─────────────────┘  └─────────────────┘
            │ 1:N
     ┌──────┴──────────────────────────────────────┐
     │ 1:N                                         │ 1:N
     ▼                                             ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│      SERVICEREQUEST       │         │         REMINDER          │
│ vehicle (Vehicle)         │         │ user (User)               │
│ owner (User)              │         │ vehicle (Vehicle)         │
│ serviceCenter (Center)    │         │ title, dueMileage, dueDate│
│ status, currentStage      │         │ priority, snoozeDays      │
└─────────────┬─────────────┘         └───────────────────────────┘
              │ 1:1 (Unique Ref)
              ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│       SERVICERECORD       │         │       SERVICECENTER       │
│ serviceRequest (Unique)   │         │ name, address, phone      │
│ invoiceNumber (INV-XXXX)  │ ◄───────┤ capacity, isActive        │
│ partsReplaced, totalCost  │         │ specialties               │
└───────────────────────────┘         └───────────────────────────┘
```

### Key Talking Points (Presenter Script)
> *"Here is the Entity Relationship Diagram for our eight Mongoose models. Every vehicle belongs to a user. When a service request is created, it references both the vehicle and the owner, as well as the chosen service center. When the service is completed, a ServiceRecord is created with a unique 1-to-1 reference to that request, guaranteeing that a request cannot be billed twice. Reminders and problem reports tie back directly to both the user and their vehicle, maintaining strict referential integrity."*

---

---

## 🖥️ SLIDE 14: Live Demonstration Script (Step-by-Step Mentor Walkthrough)

### Visual Layout
- **4-Act Live Presentation Script**: What to show on screen and what narrative to deliver.

### Slide Content

#### 🎬 Act 1: Initial Entry & Cinematic Reveal
1. **Show**: Open `http://localhost:5175/` (or refresh).
2. **Explain**: Notice the loading counter animating from 0% to 100% through the 4 phases.
3. **Action**: Watch the curtain drop to show the car covered, followed by the slow-motion uncover sweep over 4.5 seconds.
4. **Highlight**: Point out how it smoothly parks on the 3rd scene (*"Studio 03 — The Details"*) and stays there. Click `↺ REPLAY THE REVEAL` to show the recovery and repeat.

#### 🚗 Act 2: Customer Flow
1. **Action**: Click **My Garage** in the top navigation bar.
2. **Action**: Sign in as customer (`carroll@shelby.example` / `ShelbyGT1968!`) or register a new user.
3. **Highlight**: Point out the static `👤 Customer` badge—**no admin toggle is visible**.
4. **Action**: Open **Book Service**, select the Mustang, choose *Downtown Heritage Works*, pick a future date, and submit.
5. **Action**: Open **Report Problem**, report a *"Clutch chatter"* defect with **Critical** severity. Show the instant notification alert.

#### 🛡️ Act 3: Administrator Control Bay
1. **Action**: Sign out and sign in as Administrator (`staff@test.example` / `MasterTech1968!`).
2. **Highlight**: Point out that the `[ 👤 Customer ] ⇄ [ 🛡️ Admin ]` switcher is now visible.
3. **Action**: In **Overview**, show the gross revenue counter and live KPI metrics.
4. **Action**: In **Requests**, accept the booking just created by the customer, assign technician *"Dave Miller"*.
5. **Action**: In **Active Services**, click **Advance Stage (⏩)** across the Kanban stepper.
6. **Action**: Click **Complete & Invoice (📋)**: enter parts (`Holley Gasket Kit: ₹4,200`), labor (`₹5,000`), mileage, and submit.
7. **Action**: Open **Records**, view the generated `INV-2026-XXXX` invoice, and click **Print Receipt**.

### Key Talking Points (Presenter Script)
> *"I will now conduct a live demonstration in four brief acts. In Act 1, we observe the cinematic entry timer and grand reveal settling on Chapter 3. In Act 2, I will log in as a customer, demonstrating garage management and booking an appointment with strict role isolation. In Act 3, I will sign in as an administrator to accept the booking, step it through the Kanban stepper, and generate an official invoice. Finally, I will show the live notification feed and printable receipt."*

---

---

## 🖥️ SLIDE 15: Verification, Production Deployment & Roadmap

### Visual Layout
- **3 Summary Cards**: Automated Testing Results • Cloud Production Architecture • Future Engineering Roadmap.

### Slide Content

#### 🧪 1. Automated Integration Test Suite
- Run with `npm test` using the native Node.js test runner:
  ```bash
  ✔ owner isolation and full service lifecycle (3687ms)
  ℹ tests 1 | suites 0 | pass 1 | fail 0 | duration_ms 3960ms
  ```
- **Hermetic Testing**: Dynamically spins up an isolated, uniquely named temporary database on MongoDB, executes the full authentication, garage CRUD, booking lifecycle, and invoice transaction, and tears down the database upon completion.

#### ☁️ 2. Production Deployment
- **Frontend & Backend**: Hosted on **Render** (`https://cargarage.onrender.com`).
- **Database Cluster**: **MongoDB Atlas** (AWS us-east / Oregon).
- **Environment Handling**: Safe `.env.example` in Git; production variables injected securely via cloud console.
- **Port Resilience**: Server binds to `0.0.0.0` immediately with asynchronous MongoDB retry logic to satisfy cloud health checks.

#### 🚀 3. Future Roadmap
1. **OBD-II Real-Time Telemetry**: Bluetooth hardware integration to stream live engine RPM, coolant temp, and fuel pressure directly into the concierge.
2. **Stripe Payment Gateway**: Online credit card and UPI processing for invoice settlement.
3. **Mobile Native App**: React Native wrapper utilizing the existing Express REST API.

### Key Talking Points (Presenter Script)
> *"Our project is backed by a 100% passing automated test suite that tests our full lifecycle in an isolated temporary MongoDB database. We have deployed the production application to Render connected to MongoDB Atlas. Looking ahead, our architecture is ready for Stripe payment integration and OBD-II telemetry streaming. Thank you, and I am now eager to take your questions."*

---

---

## 🖥️ SLIDE 16: Mentor Defense Q&A Cheat Sheet

### Visual Layout
- **Q&A Reference Cards**: The top 6 questions examiners ask, paired with concise, bullet-proof engineering answers.

### Slide Content

#### Q1: "Why did you use HTTP-only cookies instead of storing JWT in localStorage?"
> **Answer**:  
> *"Storing tokens in `localStorage` makes them completely vulnerable to Cross-Site Scripting (XSS). Any third-party dependency or injected script can execute `localStorage.getItem()` and steal the token. By configuring our JWT inside an `httpOnly`, `SameSite: Strict` cookie, browser JavaScript cannot access the token under any circumstances, providing XSS immunity while `SameSite: Strict` prevents CSRF attacks."*

#### Q2: "How does your system prevent User A from tampering with User B's vehicle?"
> **Answer**:  
> *"We implemented a centralized security guard called `ownedVehicle(vehicleId, user)`. Every read, update, or delete route executes this middleware, which validates `String(vehicle.owner) === String(user._id)`. If a non-admin user attempts to access a car owned by another user, the server terminates the request with an immediate `403 Forbidden`."*

#### Q3: "What happens if a network failure occurs midway through invoice creation?"
> **Answer**:  
> *"We wrap the entire invoicing flow in a MongoDB multi-document ACID transaction using `mongoose.connection.transaction`. If updating the vehicle mileage, locking the service request, or saving the invoice fails, the entire transaction is rolled back. There is zero possibility of an invoice existing without updated vehicle mileage or an active booking being left in an ambiguous state."*

#### Q4: "How did you ensure the loading timer runs only once and does not annoy the user?"
> **Answer**:  
> *"The loading timer in `src/main.js` is tied to the initial page load function `prepareImages()`. Once the counter reaches 100%, we add the CSS class `.done` to `#loading`, which transitions opacity to 0 and disables pointer events. When the user navigates between the garage, booking, or admin sections, the app operates as a Single-Page Application without reloading the window, so the timer never re-triggers until a browser refresh."*

#### Q5: "How does the car reveal animation transition into Chapter 3?"
> **Answer**:  
> *"In `src/main.js`, `grandReveal()` initiates a slow-motion sweep `animateProgress(1, 4500)`. Once the sweep completes, a 900-millisecond delay allows the user to admire the uncovered vehicle before automatically invoking `setChapter(2)`. This smoothly fades `detailProgress` to 1, displaying the Chapter 3 detail image (`mustang-detail.webp`) and updating the section index to `03 / 03`, where it remains permanently."*

#### Q6: "Why is Vite in `dependencies` instead of `devDependencies`?"
> **Answer**:  
> *"Cloud PaaS providers like Render run `npm install --production` when `NODE_ENV=production` is set, which skips `devDependencies`. Because our build command `npm run build` compiles our frontend bundle with Vite during deployment, moving `vite` into `dependencies` ensures the build tool is always present in production build environments."*

---

*End of Presentation Deck • 1968 Mustang Fastback Experience & Master Service Concierge*
