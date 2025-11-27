# Academy CRM - Implementation Roadmap

> **Last Updated:** 2025-11-27  
> **API Spec:** Academy CRM API (4).yaml (10,503 lines)

## 📊 Current Implementation Status

### ✅ Completed Modules

Based on the existing codebase and recent development work:

#### **Admissions Module**
- ✅ Application management (list, create, update, delete)
- ✅ Application status workflow (NEW → IN_REVIEW → ACCEPTED/REJECTED)
- ✅ Enrollment management with full CRUD
- ✅ Enrollment status tracking (PENDING → ACTIVE → COMPLETED/WITHDRAWN)
- ✅ **Single enrollment activation** with cohort capacity checking
- ✅ **Bulk enrollment activation** (fixed in recent work)
- ✅ Waitlist functionality
- 📍 **Location:** `src/pages/admissions/` (5 files)

#### **Catalog Module**
- ✅ Programs management with active/inactive filtering
- ✅ Courses management with program association
- ✅ Cohorts management with status workflow
- ✅ Sessions management with calendar view
- ✅ **Sessions calendar** using `react-big-calendar`
- ✅ **"My Sessions"** page for lecturers
- ✅ Lecturer's cohorts view
- 📍 **Location:** `src/pages/catalog/` (4 files)

#### **Assessment Module**
- ✅ Assessment creation and management (EXAM, QUIZ, PROJECT)
- ✅ Submissions tracking
- ✅ Grade management with moderation workflow
- 📍 **Location:** `src/pages/assessment/` (3 files)

#### **Attendance Module**
- ✅ Attendance records (PRESENT, LATE, ABSENT)
- ✅ Bulk attendance marking
- ✅ Session-based attendance tracking
- 📍 **Location:** `src/pages/attendance/` (1 file)

#### **Certificates Module**
- ✅ Certificate issuance
- ✅ Certificate status management (ISSUED, REVOKED)
- 📍 **Location:** `src/pages/certificates/` (1 file)

#### **Authentication & Users**
- ✅ Login/Logout with JWT
- ✅ Token refresh
- ✅ Password reset flow
- ✅ User profile management
- 📍 **Location:** `src/pages/` (Login, Profile, etc.)

#### **Recent Fixes & Enhancements**
- ✅ Fixed Programs page routing and banner
- ✅ Fixed recruiting form program dropdown (removed hardcoded "Thinking" option)
- ✅ Dynamic program fetching from API with proper status filtering
- ✅ Resolved bulk activation 500 error

---

## 🎯 Next Implementation Priorities

### **Priority 1: High-Value Missing Features**

#### 1️⃣ **Documents Management Module** ⭐ HIGH PRIORITY

**Status:** Only 1 file exists - needs full implementation

**API Endpoints:**
```
GET    /api/v1/documents/documents/
POST   /api/v1/documents/documents/
GET    /api/v1/documents/documents/{id}/
PUT    /api/v1/documents/documents/{id}/
PATCH  /api/v1/documents/documents/{id}/
DELETE /api/v1/documents/documents/{id}/
POST   /api/v1/documents/documents/{id}/download/
```

**Features to Implement:**
- [ ] Document upload interface with drag-and-drop
- [ ] File type validation (PDF, DOCX, images, etc.)
- [ ] Document categorization (Student docs, Course materials, Certificates, Administrative)
- [ ] Document listing with filters (by category, student, cohort, date)
- [ ] File preview functionality (PDF viewer, image preview)
- [ ] Download management
- [ ] Document approval workflow (PENDING → APPROVED → REJECTED)
- [ ] Access control (students can only see their docs)
- [ ] Search functionality

**Technical Considerations:**
- File upload with progress indicator
- Maximum file size limits
- Storage integration (local or cloud)
- Thumbnail generation for images
- Document versioning support

**Business Value:**
- Essential for managing student contracts, transcripts, assignments
- Reduces paper-based processes
- Centralized document repository
- Audit trail for compliance

---

#### 2️⃣ **Reporting & Analytics Dashboard** ⭐ HIGHEST PRIORITY

**Status:** Only 1 file exists - minimal reporting functionality

**API Endpoints:**
```
GET /api/v1/reporting/reports/
POST /api/v1/reporting/reports/
```

**Features to Implement:**

##### **Dashboard Overview:**
- [ ] Total students count (Active, Pending, Completed)
- [ ] Active cohorts count
- [ ] Ongoing sessions today
- [ ] Average attendance rate
- [ ] Revenue metrics (if available)
- [ ] Trends charts (enrollment over time, completion rates)

##### **Enrollment Reports:**
- [ ] Enrollment statistics by program
- [ ] Enrollment status breakdown
- [ ] Application conversion funnel
- [ ] Cohort capacity utilization
- [ ] Waitlist analysis

##### **Academic Performance:**
- [ ] Grade distribution by assessment type
- [ ] Average scores by cohort/course
- [ ] Student performance rankings
- [ ] Submission rate tracking
- [ ] Pass/fail rates

##### **Attendance Analytics:**
- [ ] Overall attendance rate by cohort
- [ ] Individual student attendance patterns
- [ ] Lecturer attendance marking efficiency
- [ ] Late arrivals analysis
- [ ] Session attendance trends

##### **Certificate Metrics:**
- [ ] Certificates issued count
- [ ] Completion rate by program
- [ ] Time to completion analysis
- [ ] Certificate verification requests

##### **Export Functionality:**
- [ ] Export to PDF
- [ ] Export to Excel/CSV
- [ ] Email reports
- [ ] Scheduled reports

**Suggested Visualizations:**
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Heat maps for attendance
- Tables with sorting/filtering

**Technical Stack Suggestions:**
- **Chart Library:** Recharts or Chart.js
- **PDF Generation:** jsPDF or react-pdf
- **Excel Export:** xlsx library
- **Date Range Picker:** react-date-range

**Business Value:**
- Data-driven decision making
- Performance monitoring
- Identify at-risk students
- Resource allocation optimization
- Professional reporting for stakeholders

---

#### 3️⃣ **Timekeeping & Payroll Module** 🕒

**Status:** 4 files exist but functionality likely incomplete

**API Endpoints:**
```
GET    /api/v1/timekeeping/timerecords/
POST   /api/v1/timekeeping/timerecords/
GET    /api/v1/timekeeping/timerecords/{id}/
PUT    /api/v1/timekeeping/timerecords/{id}/
PATCH  /api/v1/timekeeping/timerecords/{id}/
DELETE /api/v1/timekeeping/timerecords/{id}/
POST   /api/v1/timekeeping/timerecords/{id}/approve/
POST   /api/v1/timekeeping/timerecords/bulk_approve/
```

**Features to Implement:**

##### **For Lecturers:**
- [ ] Time entry form (date, hours, cohort/session, description)
- [ ] My timesheet view (weekly/monthly)
- [ ] Time record submission
- [ ] Edit draft time records
- [ ] Submission history and status

##### **For Administrators:**
- [ ] Pending timesheet approvals dashboard
- [ ] Bulk approval interface
- [ ] Timesheet rejection with comments
- [ ] Lecturer time summary reports
- [ ] Payment calculation (hours × rate)
- [ ] Export for payroll processing

##### **Advanced Features:**
- [ ] Automatic time logging from sessions
- [ ] Overtime tracking
- [ ] Holiday/PTO tracking
- [ ] Monthly timesheets with approval workflow
- [ ] Integration with session attendance

**Business Value:**
- Accurate lecturer payment tracking
- Reduced administrative overhead
- Transparent time recording
- Audit trail for financial compliance

---

#### 4️⃣ **Gallery & Media Management** 🖼️

**Status:** Only 1 file exists

**API Endpoints:**
```
GET    /api/v1/gallery/gallery/
POST   /api/v1/gallery/gallery/
GET    /api/v1/gallery/gallery/{id}/
PUT    /api/v1/gallery/gallery/{id}/
PATCH  /api/v1/gallery/gallery/{id}/
DELETE /api/v1/gallery/gallery/{id}/
```

**Features to Implement:**
- [ ] Image/video upload interface
- [ ] Gallery grid view with masonry layout
- [ ] Album/category organization
- [ ] Public gallery page (for marketing)
- [ ] Private gallery for internal events
- [ ] Image editing/cropping
- [ ] Lightbox for full-screen viewing
- [ ] Tags and metadata
- [ ] Social media sharing

**Use Cases:**
- Graduation ceremonies
- Workshop photos
- Student projects showcase
- Campus events
- Promotional materials

**Business Value:**
- Marketing and recruitment tool
- Community engagement
- Alumni relations
- Social proof for prospective students

---

### **Priority 2: UI/UX Enhancements**

#### 5️⃣ **Enhanced Student Portal**

**Current:** Basic student portal exists (`StudentPortal.tsx` - 10,602 bytes)

**Enhancements to Add:**
- [ ] **Dashboard Overview:**
  - Current enrollment status
  - Upcoming sessions (next 7 days)
  - Recent grades
  - Attendance summary
  - Pending tasks/submissions

- [ ] **My Courses Tab:**
  - Enrolled cohorts list
  - Course materials access
  - Session schedule
  - Progress tracking

- [ ] **Grades & Performance:**
  - Grade history table
  - Grade trends chart
  - Assessment scores comparison
  - GPA calculation

- [ ] **Attendance History:**
  - Attendance rate percentage
  - Calendar view of attendance
  - Late arrivals tracking
  - Excused absences

- [ ] **Documents:**
  - My documents (contracts, transcripts)
  - Download certificates
  - Upload required documents

- [ ] **Profile & Settings:**
  - Personal information
  - Contact details
  - Password change
  - Notification preferences

---

#### 6️⃣ **Comprehensive Lecturer Dashboard**

**Current:** Lecturer pages exist (2 files in `src/pages/lecturer/`)

**Features to Build:**
- [ ] **My Cohorts Overview:**
  - Active cohorts list
  - Student count per cohort
  - Cohort status
  - Quick access links

- [ ] **My Sessions:**
  - ✅ Already implemented with calendar view
  - [ ] Today's sessions highlight
  - [ ] Mark attendance quick link
  - [ ] Session materials upload

- [ ] **Attendance Management:**
  - [ ] Quick attendance marking
  - [ ] Bulk mark all present
  - [ ] Attendance statistics by cohort
  - [ ] Late students notification

- [ ] **Grade Management:**
  - [ ] Pending grade submissions
  - [ ] Grade entry forms
  - [ ] Grade distribution view
  - [ ] Student performance alerts

- [ ] **Time Tracking:**
  - [ ] This week's hours
  - [ ] Pending timesheet submissions
  - [ ] Payment summary

- [ ] **Resources:**
  - [ ] Upload course materials
  - [ ] Share documents with students
  - [ ] Assessment templates

---

#### 7️⃣ **Public-Facing Pages Enhancement**

**Current:** 3 files in `src/pages/public/`

**Pages to Improve/Add:**

##### **Program Catalog (Public):**
- [ ] All active programs list
- [ ] Program details page (description, duration, courses)
- [ ] Pricing information
- [ ] Start dates and cohort availability
- [ ] Testimonials
- [ ] Apply now CTA

##### **Application Form:**
- [ ] ✅ Recruiting form exists and fixed
- [ ] Multi-step application wizard
- [ ] Document upload in application
- [ ] Application status tracking (public)
- [ ] Email notifications

##### **Certificate Verification:**
- [ ] Public certificate verification page
- [ ] Enter certificate ID/verification code
- [ ] Display certificate details
- [ ] Download verified certificate
- [ ] QR code verification

##### **Events & News:**
- [ ] Upcoming events calendar
- [ ] Past events gallery
- [ ] News/blog section
- [ ] Registration for public events

##### **About Pages:**
- [ ] About the academy
- [ ] Faculty profiles
- [ ] Success stories
- [ ] Contact information
- [ ] FAQ

---

### **Priority 3: Missing API Integration**

These endpoints exist in the API but aren't fully integrated in the UI:

#### 8️⃣ **Waitlist Management**

**Endpoint:** `GET /api/v1/admissions/enrollments/waitlist/`

**Features to Add:**
- [ ] Waitlist dashboard showing pending enrollments for full cohorts
- [ ] Automatic notification when cohort space becomes available
- [ ] Waitlist priority management
- [ ] Waitlist to enrollment conversion

---

#### 9️⃣ **Grade Moderation Workflow**

**Endpoint:** `POST /api/v1/assessment/grades/{id}/moderate/`

**Features to Add:**
- [ ] Pending moderation queue for admins
- [ ] Grade review interface
- [ ] Approve/reject grades submitted by lecturers
- [ ] Moderation comments
- [ ] Notification to lecturer on moderation decision

---

#### 🔟 **Certificate Revocation**

**Endpoint:** `POST /api/v1/certificates/certificates/{id}/revoke/`

**Features to Add:**
- [ ] Revoke certificate button in certificate details
- [ ] Revocation reason field
- [ ] Revocation confirmation modal
- [ ] Revoked certificates list
- [ ] Audit log for certificate changes

---

#### 1️⃣1️⃣ **Automated Session Generation**

**Endpoint:** `POST /api/v1/catalog/cohorts/{id}/generate_sessions/`

**Features to Add:**
- [ ] Session generation wizard in cohort details
- [ ] Specify recurrence pattern (weekly, bi-weekly, etc.)
- [ ] Set start/end dates
- [ ] Define session duration
- [ ] Select days of the week
- [ ] Preview generated sessions
- [ ] Bulk create sessions

**Parameters to Configure:**
- Recurrence frequency
- Number of sessions
- Session start time
- Session duration
- Lecturer assignment
- Room/location

---

### **Priority 4: Quality & Performance**

#### 1️⃣2️⃣ **Testing Coverage**

**Current:** 5 test files in `src/__tests__/`

**Areas to Expand:**
- [ ] Unit tests for all API client functions
- [ ] Component tests for critical UI components
- [ ] Integration tests for key workflows:
  - [ ] Application → Enrollment → Activation flow
  - [ ] Grade submission and moderation
  - [ ] Attendance marking
  - [ ] Document upload/download
- [ ] E2E tests using Playwright or Cypress:
  - [ ] User login flow
  - [ ] Application submission
  - [ ] Bulk enrollment activation
  - [ ] Report generation

**Testing Framework:**
- Vitest (already configured)
- React Testing Library
- Playwright/Cypress for E2E

---

#### 1️⃣3️⃣ **Performance Optimizations**

**Current Issues to Address:**
- [ ] Implement proper pagination on all list views
- [ ] Add data caching with React Query/TanStack Query
- [ ] Optimize bundle size:
  - [ ] Code splitting by route
  - [ ] Lazy loading for heavy components
  - [ ] Tree shaking unused dependencies
- [ ] Image optimization (WebP, lazy loading)
- [ ] API response caching
- [ ] Debounce search inputs
- [ ] Virtual scrolling for large tables

**Monitoring:**
- [ ] Add performance monitoring (Lighthouse CI)
- [ ] Error tracking (Sentry integration)
- [ ] Analytics (Google Analytics or similar)

---

#### 1️⃣4️⃣ **Code Quality Improvements**

**Technical Debt to Address:**
- [ ] Consistent error handling patterns
- [ ] Type safety improvements (strict TypeScript)
- [ ] ESLint rule enforcement
- [ ] Prettier code formatting
- [ ] Component documentation (Storybook)
- [ ] API client code generation from OpenAPI spec
- [ ] Shared component library
- [ ] Design system documentation

---

## 🚀 Recommended Implementation Order

Based on business value and complexity:

### **Phase 1: Analytics Foundation (2-3 weeks)**
1. **Reporting Dashboard** - Highest business value, uses existing data
2. **Enhanced Student Portal** - Improves user experience
3. **Lecturer Dashboard** - Empowers instructors

### **Phase 2: Document & Content Management (2-3 weeks)**
4. **Documents Module** - Critical for operations
5. **Gallery Module** - Marketing value
6. **Public Pages Enhancement** - Recruitment support

### **Phase 3: Operational Features (2-3 weeks)**
7. **Timekeeping Module** - Financial tracking
8. **Waitlist Management** - Enrollment optimization
9. **Session Generation** - Time-saving automation
10. **Grade Moderation** - Quality assurance

### **Phase 4: Quality & Polish (1-2 weeks)**
11. **Testing Coverage** - Stability and confidence
12. **Performance Optimization** - User experience
13. **Code Quality** - Maintainability

---

## 📋 API Endpoint Reference

### **Summary of All API Modules:**

| Module | Endpoints | Status | Priority |
|--------|-----------|--------|----------|
| **Admissions** | Applications (6), Enrollments (10) | ✅ Complete | - |
| **Assessment** | Assessments (6), Grades (7), Submissions (6) | ✅ Complete | - |
| **Attendance** | Records (6), Bulk (1) | ✅ Complete | - |
| **Catalog** | Programs (6), Courses (6), Cohorts (7), Sessions (6), My (2) | ✅ Complete | - |
| **Certificates** | Certificates (7) | ✅ Basic | Medium |
| **Documents** | Documents (7) | ⚠️ Minimal | **HIGH** |
| **Gallery** | Gallery (6) | ⚠️ Minimal | Medium |
| **Reporting** | Reports (2+) | ⚠️ Minimal | **HIGHEST** |
| **Timekeeping** | TimeRecords (8) | ⚠️ Partial | **HIGH** |
| **Users** | Students (6), Lecturers (6) | ✅ Complete | - |
| **Auth** | Login, Refresh, Password Reset | ✅ Complete | - |

**Total Endpoints:** ~100+ endpoints across all modules

---

## 🎨 UI/UX Design Patterns to Follow

Based on existing codebase patterns:

### **Components Used:**
- **shadcn/ui** for UI components (buttons, forms, dialogs)
- **TailwindCSS** for styling
- **Lucide React** for icons
- **React Query** for data fetching (if not already, should implement)
- **React Router** for navigation
- **React Hook Form** for form management
- **Zod** for validation

### **Consistent Patterns:**
- List views with search, filter, pagination
- Modal forms for create/edit operations
- Confirmation dialogs for destructive actions
- Loading states and error handling
- Toast notifications for user feedback
- Responsive design (mobile-friendly)

---

## 📝 Notes & Considerations

### **Recent Fixes Applied:**
- Removed hardcoded "Thinking" option from recruiting program dropdown
- Fixed bulk enrollment activation endpoint
- Corrected payload structure for bulk operations
- Added proper error handling for 500 errors

### **Known Technical Constraints:**
- API uses JWT authentication
- All UUIDs for resource identification
- Pagination required for large lists
- File upload size limits (check API spec)

### **Future Enhancements to Consider:**
- Real-time notifications (WebSocket/SSE)
- Mobile app (React Native)
- Email integration improvements
- SMS notifications
- Payment gateway integration
- Learning Management System features
- Video conferencing integration
- Automated certificate generation
- AI-powered student recommendations

---

## 📞 Support & Documentation

### **API Documentation:**
- OpenAPI Spec: `Academy CRM API (4).yaml`
- Total Lines: 10,503
- Version: 1.0.0

### **Project Structure:**
```
acade-portal/
├── src/
│   ├── pages/           # Route components
│   ├── components/      # Reusable components
│   ├── api/            # API client functions
│   ├── hooks/          # Custom React hooks
│   ├── store/          # State management
│   └── utils/          # Helper functions
├── public/             # Static assets
└── dist/              # Production build
```

### **Development Commands:**
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
```

---

## ✅ Quick Start for Next Task

**Recommended Next Steps:**

1. **Immediate (Today):** Start with **Reporting Dashboard**
   - Create `src/pages/reporting/Dashboard.tsx`
   - Add basic metrics cards
   - Integrate with existing API endpoints

2. **This Week:** Complete core reporting features
   - Enrollment statistics
   - Attendance analytics
   - Grade distribution charts

3. **Next Week:** Documents module implementation
   - File upload interface
   - Document listing and filtering
   - Preview and download functionality

---

**Document Version:** 1.0  
**Last Review:** 2025-11-27  
**Next Review:** After Phase 1 completion
