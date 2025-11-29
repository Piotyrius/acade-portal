# Missing API Features in Frontend

## Analysis Summary

After comparing `Academy CRM API (6).yaml` (11,408 lines, 109 endpoints) with the current frontend implementation, here are the **missing features** that need to be added:

---

## 🔴 **Priority 1: Completely Missing Modules**

### 1. **Payments Module** - COMPLETELY MISSING ⚠️

**Status:** No API endpoints file exists, no frontend pages

**Missing Endpoints (30+ endpoints):**

- `/api/v1/payments/discounts/` - CRUD operations
- `/api/v1/payments/invoices/` - CRUD + `apply_discounts`, `issue`, `outstanding_balance`, `create_for_enrollment`
- `/api/v1/payments/payment-methods/` - CRUD operations
- `/api/v1/payments/payment-plans/` - CRUD operations
- `/api/v1/payments/payment-schedules/` - CRUD + `mark_overdue`
- `/api/v1/payments/payments/` - CRUD + `process_refund`, `record_payment`
- `/api/v1/payments/pricings/` - CRUD operations

**Files to Create:**

- `src/api/endpoints/payments.ts` - Complete payments API client
- `src/pages/payments/` directory with pages:
  - `Invoices.tsx` - Invoice management
  - `Discounts.tsx` - Discount management
  - `PaymentPlans.tsx` - Payment plan configuration
  - `PaymentMethods.tsx` - Payment method management
  - `PaymentSchedules.tsx` - Payment schedule tracking
  - `Pricings.tsx` - Pricing management

**Business Impact:** HIGH - Critical for financial operations

---

### 2. **Analytics & Reporting** - PARTIALLY MISSING ⚠️

**Status:** Only CSV export endpoints exist, analytics endpoints missing

**Missing Endpoints:**

- `/api/v1/reporting/analytics/by-cohort/` - Cohort performance metrics
- `/api/v1/reporting/analytics/financial/` - Financial analytics
- `/api/v1/reporting/analytics/overview/` - Aggregated metrics dashboard
- `/api/v1/reporting/analytics/student-financial/` - Student financial reports
- `/api/v1/reporting/analytics/timeseries/` - Time-series data (day/week/month grouping)
- `/api/v1/reporting/reports/payroll/` - Payroll report (different from timekeeping export)

**Files to Update:**

- `src/api/endpoints/reporting.ts` - Add analytics functions
- `src/pages/reporting/Reporting.tsx` - Add analytics dashboard UI

**Features to Add:**

- Analytics dashboard with charts (recharts/chart.js)
- Cohort performance metrics visualization
- Financial analytics with breakdowns
- Time-series charts for enrollments/payments
- Student financial report table

---

### 3. **Multi-Factor Authentication (MFA)** - COMPLETELY MISSING ⚠️

**Status:** No implementation exists

**Missing Endpoints:**

- `POST /api/v1/users/mfa_setup/` - Start MFA setup, generate TOTP secret
- `POST /api/v1/users/mfa_verify/` - Verify MFA code and enable MFA
- `POST /api/v1/users/mfa_disable/` - Disable MFA

**Files to Create:**

- Update `src/api/endpoints/auth.ts` - Add MFA functions
- `src/pages/SecuritySettings.tsx` - MFA setup/management page
- `src/components/MfaSetup.tsx` - QR code display component

**Features to Add:**

- QR code generation for TOTP setup
- MFA code input/verification
- Enable/disable MFA toggle
- Backup codes display

---

## 🟡 **Priority 2: Missing Endpoints in Existing Modules**

### 4. **Documents Module** - Missing Download Endpoint

**Status:** CRUD exists, download missing

**Missing Endpoint:**

- `POST /api/v1/documents/documents/{id}/download/` - Download document file

**File to Update:**

- `src/api/endpoints/documents.ts` - Add `downloadDocument(id: string): Promise<Blob>`

**UI Impact:** Add download button in `src/pages/documents/Documents.tsx`

---

### 5. **Me Endpoints** - Missing Financial Endpoints

**Status:** Partially implemented (enrollments, attendance, assessments, grades, certificates exist)

**Missing Endpoints:**

- `GET /api/v1/me/outstanding_balance/` - Get student's total outstanding balance
- `GET /api/v1/me/payments/` - Get student's invoices and payments

**File to Update:**

- `src/api/endpoints/studentPortal.ts` - Add missing functions
- `src/pages/StudentPortal.tsx` - Display outstanding balance and payment history

---

### 6. **Reporting - Payroll Report**

**Status:** Timekeeping has payroll export, but reporting module has separate payroll report

**Missing Endpoint:**

- `GET /api/v1/reporting/reports/payroll/` - Payroll report (different from `/api/v1/timekeeping/payroll/export`)

**File to Update:**

- `src/api/endpoints/reporting.ts` - Add `exportPayrollReport()` function

---

## 🟢 **Priority 3: UI Enhancements Needed**

### 7. **Documents Module UI** - Needs Full Implementation

**Status:** Basic CRUD exists, but UI is minimal

**Missing Features:**

- Document upload with drag-and-drop
- File preview (PDF viewer, image preview)
- Document categorization filters
- Search functionality
- Download functionality (once endpoint is added)

**File to Enhance:**

- `src/pages/documents/Documents.tsx` - Full document management UI

---

### 8. **Gallery Module** - Missing Publish Feature UI

**Status:** API endpoint exists (`publishWork`), but UI may not use it

**Missing:**

- Publish/unpublish toggle in gallery UI
- Public/private visibility management

**File to Check/Update:**

- `src/pages/gallery/MyWorks.tsx` - Add publish functionality

---

## 📊 **Summary Statistics**

| Module | Endpoints in API | Implemented | Missing | Priority |
|--------|-----------------|-------------|---------|----------|
| **Payments** | 30+ | 0 | 30+ | 🔴 HIGH |
| **Analytics** | 6 | 0 | 6 | 🔴 HIGH |
| **MFA** | 3 | 0 | 3 | 🔴 HIGH |
| **Documents** | 7 | 6 | 1 | 🟡 MEDIUM |
| **Me Endpoints** | 7 | 5 | 2 | 🟡 MEDIUM |
| **Reporting** | 7 | 6 | 1 | 🟡 MEDIUM |

**Total Missing:** ~43 endpoints across 6 modules

---

## 🎯 **Recommended Implementation Order**

1. **Payments Module** (Critical for financial operations)
2. **Analytics Dashboard** (High business value for insights)
3. **MFA Security** (Security best practice)
4. **Document Download** (Quick win, high usage)
5. **Me Endpoints** (Student portal enhancement)
6. **UI Enhancements** (Polish existing features)

---

## 📝 **Notes**

- All existing endpoints in `src/api/endpoints/` appear to be correctly implemented
- The roadmap document (`IMPLEMENTATION_ROADMAP.md`) is outdated and references API v4, while current API is v6
- Some endpoints may have different names (e.g., `gallery/works/` vs `gallery/gallery/` in roadmap)
- The YAML file shows the API uses `/api/v1/` prefix consistently

---

## 📅 **Last Updated**

- **Date:** 2025-01-XX
- **API Version:** v6
- **API Spec File:** `Academy CRM API (6).yaml`
- **Total API Endpoints:** 109
- **Missing Endpoints:** ~43

