## Admin, Lecturer & Student Usage Guide

This document describes how to use the current frontend for **admins**, **lecturers**, and **students**.

---

## 1. Navigation & Sections (All Roles)

The left sidebar is organized by tasks:

- **Home**
  - Dashboard with key cards for:
    - New applications
    - Active enrollments
    - Outstanding / overdue invoices
    - Upcoming classes / sessions
  - Each card links to the relevant section (Admissions, Billing, Teaching, etc.).

- **Admissions**
  - Manage leads and **applications**.
  - Accept applications into **enrollments** and automatically create invoices.

- **Programs & Cohorts**
  - Manage **programs**, **courses**, and **cohorts**.
  - Set up recruitment goals and upcoming cohorts.
  - Access cohort‑level actions (students, attendance, grades, billing shortcuts).

- **Billing & Payments**
  - Handle **invoices**, **payments**, **pricing**, **plans**, and **discounts**.
  - “Bill a student” and “Record payment” wizards live here.

- **Teaching**
  - Teaching hub for **assessments, submissions, and grades**.
  - Quick actions to **Take attendance today** and **Enter grades**.

- **Attendance**
  - Dedicated screen to view and mark attendance, including bulk marking.

- **Reports / Timekeeping / Documents / Certificates / Gallery / Users**
  - Supporting admin areas for reporting, HR/time, documents, certificates, media, and user admin.

- **Lecturer Portal**
  - Lecturer‑specific dashboard and sessions view.

- **Student Portal**
  - Student’s own overview of enrollments, progress, and finances.

---

## 2. Admissions: From Application to Enrollment & Invoice (Admins)

### 2.1 Review Applications

1. Go to **Admissions → Applications**.
2. Use the **search box** to filter by applicant name or email.
3. Each application shows:
   - Name, email, and requested program.
   - Status badge: `NEW`, `IN_REVIEW`, `ACCEPTED`, `REJECTED`.
4. Use:
   - **Accept** to start the Accept → Enroll → Bill flow.
   - **Reject** to mark the application as rejected.

### 2.2 Accept → Enroll → Bill Wizard

For any `NEW` or `IN_REVIEW` application:

1. Click **Accept** on the application row.
2. A two‑step wizard opens.

**Step 1 – Choose cohort**

- Choose a **cohort** from the dropdown (filtered to the program’s cohorts).
- Cohort is required.
- Click **Next: Billing options**.

**Step 2 – Billing options**

- **Payment plan** (required):
  - Select one of the active payment plans (Monthly, Full, Custom, etc.).
- **Discounts** (optional):
  - Tick any applicable active discounts in the list.
- Helper text explains that tuition, discounts, and schedule are auto‑calculated from pricing.

**Finish**

- Click **Create enrollment & invoice**.
- The system will:
  - Accept the application and create an **enrollment**.
  - Create an **invoice** for that enrollment, using the selected plan and discounts.
  - Refresh applications, enrollments, and invoices automatically.

---

## 3. Programs & Cohorts (Admins)

### 3.1 Programs List & Recruitment Planning

1. Go to **Programs & Cohorts → Programs**.
2. Use:
   - Search box: filter by program name or code.
   - Filter: `All`, `Active`, `Inactive`.
3. Actions:
   - **Add Program**
     - Create a new program with name, code, description, and active flag.
   - **Plan recruitment**
     - Opens a simple recruitment planning wizard.

#### Recruitment Planning Wizard

From **“Plan recruitment”**:

**Step 1 – Pick programs & date range**

- Tick one or more **programs** to recruit for.
- Choose **Target start (month)** and **Target end (month)**.
- Click **Next: Set goals**.

**Step 2 – Set goals**

- **Total applications target** (required), e.g. `30`.
- **Target enrollments per cohort** (optional), e.g. `15`.
- Click **Review plan**.

**Step 3 – Review & confirm**

- Review:
  - Selected programs.
  - Date range.
  - Total applications goal and optional enrollments‑per‑cohort.
- Click **Confirm plan**.
- The system computes:
  - Number of months in the range.
  - Approximate **applications per month**.
  - A simple month‑by‑month breakdown.
- A **Recruitment plan summary** card appears on the Programs page.  
  (This is a planning helper only; it does **not** modify backend data.)

### 3.2 Cohorts List & Cohort‑Level Actions

1. Go to **Programs & Cohorts → Cohorts**.
2. For each cohort card you see:
   - Name, course title, lecturer.
   - Status badge (Planned, Enrolling, Active, Completed).
   - Current enrollment count and capacity.
   - Start date.

**Cohort header actions:**

- **View students** (eye/chevron icon)
  - Expands an **Enrolled Students** section showing:
    - Student name.
    - Enrollment status badge.
    - Simple **Paid / Not Paid this month** badge.
- **Take attendance**
  - Navigates to: `Attendance` list with `?cohort=<cohortId>` so the list is pre‑focused.
- **Enter grades**
  - Navigates to: `Teaching` (Assessment unified page) with tab set to **Grades**, plus `?cohort=<cohortId>`.
- **Generate sessions**
  - Opens a dialog to generate sessions (date pattern, start/end time, etc.) for the cohort.
- **Edit** and **Delete**
  - Standard cohort management.

---

## 4. Billing & Payments (Admins)

You’ll typically use:

- **Billing overview** (Payments unified page) for quick actions.
- **Invoices** for billing and marking invoices as paid.
- **Payments** for history and refunds.

### 4.1 Bill a Student from an Enrollment

You can start this from:

- **Billing overview** (quick action **“Bill a student”**), or
- **Billing & Payments → Invoices** via **“Bill student from enrollment”** button.

In the **Bill student from enrollment** dialog:

1. **Enrollment**
   - Select the relevant **enrollment**.
2. **Payment plan**
   - Required: pick a payment plan.
3. **Discounts (optional)**
   - Tick any valid discounts to apply.
4. Confirm:
   - Click the button to create the invoice.

The system:

- Uses backend pricing rules (cohort / course / program) to determine line amounts.
- Generates an **invoice** and its **payment schedule**.
- Notifies you via toast and refreshes the invoice list.

### 4.2 Invoices Page (List + Details)

Go to **Billing & Payments → Invoices**.

**Header & primary actions:**

- Description:
  - “See each student’s bill, track what’s outstanding, and mark invoices as paid.”
- Buttons:
  - **Bill student from enrollment** – opens bill wizard.
  - **New manual invoice** – opens full invoice creation form.

**Tabs:**

- **All invoices**
  - Search bar:
    - Search by invoice number, student, or cohort name.
  - Status filter:
    - `All statuses`, `Draft`, `Issued`, `Partially paid`, `Paid`, `Overdue`, `Cancelled`.
  - Each row shows:
    - Invoice number.
    - Status badge.
    - Student name.
    - Enrollment label (student + cohort).
    - Cohort name.
    - Total amount (formatted).
    - Outstanding amount (if any).
    - Due date.
  - Row actions:
    - For **Draft**:
      - **Edit** (opens invoice form).
      - **Delete**.
      - **Issue** invoice.
    - For **Issued / Partial / Overdue**:
      - **Apply discounts** (on Issued).
      - **Mark as paid** (opens Record payment dialog tied to this invoice).
  - Clicking anywhere on a row selects it for the **Invoice details** tab.

- **Invoice details**
  - Shows details of the currently selected invoice:
    - Number, student, cohort.
    - Status, total, outstanding, due date.
  - **Advanced billing details** (expandable):
    - Pricing ID (source).
    - Payment plan name.
    - Subtotal and discount amount.
    - Created / updated timestamps.
    - Raw invoice ID.
  - Actions:
    - **Mark a payment** – opens the Record payment dialog with invoice preselected.
    - **Issue invoice** – if status is Draft.
    - **Apply discounts** – opens discounts dialog for this invoice.

### 4.3 Record a Payment (Preferred: from Invoice)

From **Invoices**:

1. On an `ISSUED`, `PARTIAL`, or `OVERDUE` invoice:
   - Click **Mark as paid** (row) or **Mark a payment** (details tab).
2. In the **Record payment** dialog:
   - **Invoice**: already fixed to the selected invoice.
   - **Amount**:
     - Defaults to the outstanding amount; you can adjust if needed.
   - **Payment method**:
     - Choose the method (Manual, Cash, Bank Transfer, Card, etc.).
   - **Payment date**:
     - Defaults to today; can be changed.
   - **Notes**:
     - Optional comment (e.g. reference, internal notes).
3. Click **Record payment**.
4. Result:
   - Calls the `record_payment` backend endpoint.
   - Updates invoice status and payment history.
   - Refreshes invoices and payments lists.

### 4.4 Payments Page (History & Refunds)

Go to **Billing & Payments → Payments**.

- Description:
  - “See payment history and refunds. Use invoices to mark new payments.”
- Filters:
  - Search by payment reference.
  - Filter by **invoice** and **status** (`All`, `Pending`, `Completed`, `Failed`, `Refunded`).
- Each row shows:
  - Payment reference:
    - Transaction ID, payment number, or invoice number.
  - Payment and status badges.
  - Amount and payment date.
  - Student + cohort label.
  - Notes (if present).
- Actions:
  - **Process refund**:
    - Available for `COMPLETED` payments.
    - Opens a refund dialog to specify amount and reason.
  - **Delete payment**:
    - Admin‑only cleanup.

- **Record payment** button:
  - Also opens the **Record payment** dialog (same simplified flow as from Invoices), for manual entry when you already know the invoice.

---

## 5. Teaching Flows (Lecturers & Admins)

### 5.1 Teaching Hub (Assessments & Grades)

Go to **Teaching** (Assessment unified page).

- Header buttons:
  - **Take attendance today**
    - Jumps to **Attendance list**.
  - **Enter grades**
    - Switches the Teaching tabs to **Grades** and focuses the grading UI.

- Tabs:
  - **Assessments**
    - Create and manage assessments.
  - **Submissions**
    - View and manage student submissions.
  - **Grades**
    - Enter and edit grades, and moderate them (approve/reject where applicable).

### 5.2 Attendance List

Reachable via:

- Sidebar **Attendance**, or
- Teaching **Take attendance today**, or
- Cohorts **Take attendance**.

Behavior:

- If opened with `?cohort=<id>`, the search field is initialized to that cohort ID to highlight relevant records.

On this page you can:

- Filter attendance by search.
- See rows of:
  - Student, session/cohort, status, note.
- **Mark a single record**:
  - Click to open dialog.
  - Select status (Present, Absent, Late, Excused) and optional note.
- **Bulk mark**:
  - Open **Bulk Mark** dialog.
  - Choose a **session**.
  - System pre‑lists students for the session’s cohort.
  - For each student choose status (toggle).
  - Save once to create/update all records for that session in bulk.

---

### 5.3 Lecturer Portal (Lecturer View)

Go to **Lecturer Portal** (when logged in as a lecturer).

- **Lecturer Dashboard**
  - Shows upcoming sessions, recent submissions/grades, and quick shortcuts into Teaching and Attendance.
- **My Sessions**
  - List of sessions you are teaching, with dates and times.
  - Use this together with **Attendance** and **Teaching** to:
    - Take attendance for today’s session.
    - Enter grades for assessments tied to your cohorts.

Lecturers mainly use:

- **Teaching** for assessments, submissions, and grades.
- **Attendance** for marking presence.
- **Lecturer Portal / My Sessions** to see their schedule.

---

## 6. Student Portal (Student View)

Go to **Student Portal** (when logged in as a student).

- Tabs:
  - **Enrollments**
    - Student’s enrollments with status and dates.
  - **Attendance**
    - List of attendance records by session.
  - **Assessments**
    - Assigned assessments, descriptions, and due dates.
  - **Grades**
    - Grades with score, max score, and percentage.
  - **Certificates**
    - Issued certificates and their statuses.
  - **Financial**
    - Balance and financial history.

Financial tab:

- **Your balance**:
  - Shows outstanding balance and next due date.
- **History table**:
  - Invoices and payments with statuses (ISSUED, OVERDUE, PAID) and explanations.
- Amounts:
  - Use the same currency formatting as admin billing to stay consistent.

---

## 7. Mental Models by Role

### 7.1 Admins

- Think in **tasks**, not models:
  - Admissions → **Accept & enroll & bill**.
  - Billing & Payments → **Bill a student** and **Mark as paid**.
  - Teaching / Cohorts → **Take attendance** and **Enter grades**.
  - Programs → **Plan recruitment** and configure your catalog.

- Use **Invoices** as the central source of truth for finances:
  - Create invoices from enrollments (preferred) or manually.
  - Record payments on invoices.
  - Use **Payments** for history, filters, and refunds.

- Use **Cohorts** as the hub for teaching:
  - See students, statuses, and payments.
  - Jump directly to attendance and grades for that group.

### 7.2 Lecturers

- Focus on:
  - **Lecturer Portal / My Sessions** to see what you are teaching today.
  - **Teaching** → **Grades** tab to enter and update grades.
  - **Attendance** (or **Take attendance today** button) to mark presence.
- You do **not** need to work with invoices, pricing, or payment plans.

### 7.3 Students

- Use **Student Portal** to:
  - Track your **enrollments**, **attendance**, **assessments**, **grades**, and **certificates**.
  - Check your **Financial** tab for balance, due dates, and payment history.
- Billing logic (invoices, payment plans, pricing) is handled by admins; you only see a clear, student‑friendly view of what you owe and what you have paid.



