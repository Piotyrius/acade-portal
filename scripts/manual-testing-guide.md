# Manual Testing Guide - Pre-Deployment Verification

## Prerequisites

1. **Backend Running**: Ensure backend is running on `https://academy-crm.onrender.com`
2. **Frontend Running**: Start dev server with `npm run dev`
3. **Browser DevTools**: Open Chrome/Firefox DevTools (F12)
   - Network tab (to verify API calls)
   - Console tab (to check for errors)
   - Application tab (to check localStorage/tokens)

## Testing Checklist

### 1. Authentication & Token Management

#### Login
- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Check Network tab: POST to `/api/v1/auth/login/`
- [ ] Verify response contains `access` and `refresh` tokens
- [ ] Verify tokens stored in localStorage
- [ ] Verify redirect to dashboard after login

#### Token Refresh
- [ ] Wait for access token to expire (or manually expire it)
- [ ] Make any API call
- [ ] Check Network tab: Should see POST to `/api/v1/auth/refresh/`
- [ ] Verify new access token stored
- [ ] Verify original request retried successfully

#### Logout
- [ ] Click logout button
- [ ] Check Network tab: POST to `/api/v1/auth/logout/` with `{ refresh: "..." }`
- [ ] Verify tokens cleared from localStorage
- [ ] Verify redirect to login page

### 2. Fixed API Endpoints

#### Timekeeping Payroll Export
- [ ] Navigate to Timekeeping > Work Logs
- [ ] Click "Export Payroll" button
- [ ] Check Network tab: GET `/api/v1/timekeeping/payroll/export/` (with trailing slash)
- [ ] Verify CSV file downloads
- [ ] Verify no 404 errors

#### Reporting Payroll Export
- [ ] Navigate to Reporting page
- [ ] Click "Export Payroll" button
- [ ] Check Network tab: Should redirect to timekeeping endpoint
- [ ] Verify CSV file downloads
- [ ] Verify no 404 errors

#### Catalog Lecturer Endpoints
- [ ] Login as LECTURER user
- [ ] Navigate to Catalog or Lecturer Dashboard
- [ ] Check Network tab for:
  - GET `/api/v1/catalog/my/cohorts/` (not `/cohorts/me/`)
  - GET `/api/v1/catalog/my/sessions/` (not `/sessions/me/`)
- [ ] Verify data loads correctly
- [ ] Verify no 404 errors

#### Subscriptions Create
- [ ] Navigate to Subscriptions page (as ADMIN)
- [ ] Click "Create Subscription"
- [ ] Fill form and submit
- [ ] Check Network tab: POST `/api/v1/subscriptions/subscriptions/create_subscription/` (not `create_new/`)
- [ ] Verify subscription created successfully
- [ ] Verify no 404 errors

#### Document Download
- [ ] Navigate to Documents page
- [ ] Click download button on any document
- [ ] Check Network tab: GET `/api/v1/documents/documents/{id}/download/` (not POST)
- [ ] Verify file downloads
- [ ] Verify no 404 errors

#### Profile Picture Upload
- [ ] Navigate to Profile page
- [ ] Upload a profile picture
- [ ] Check Network tab: POST `/api/v1/users/upload_profile_picture/`
- [ ] Check request headers: Should NOT have `Content-Type: multipart/form-data` (browser sets it automatically)
- [ ] Verify upload succeeds
- [ ] Verify no 400/500 errors

### 3. Payment Endpoints

#### Create Invoice from Enrollment
- [ ] Navigate to Invoices page
- [ ] Click "Create from Enrollment"
- [ ] Verify dialog shows:
  - Enrollment field (required)
  - Payment Plan field (required) - NEW
  - Discounts field (optional) - NEW
- [ ] Select enrollment and payment plan
- [ ] Optionally select discounts
- [ ] Submit form
- [ ] Check Network tab: POST `/api/v1/payments/invoices/create_for_enrollment/`
- [ ] Verify payload includes: `{ enrollment, payment_plan, discounts? }`
- [ ] Verify invoice created successfully

#### Record Payment
- [ ] Navigate to Payments page
- [ ] Click "Record Payment" (if available)
- [ ] Fill form with:
  - Invoice (required)
  - Amount (required)
  - Payment Method (optional)
  - Notes (optional)
- [ ] Submit
- [ ] Check Network tab: POST `/api/v1/payments/payments/record_payment/`
- [ ] Verify payload is simplified (only invoice, amount, payment_method?, notes?)
- [ ] Verify payment recorded successfully

#### Get Invoice Outstanding Balance
- [ ] Navigate to Invoices page
- [ ] Click on an invoice to view details
- [ ] Check Network tab: GET `/api/v1/payments/invoices/{id}/outstanding_balance/`
- [ ] Verify response structure:
  ```json
  {
    "invoice_number": "...",
    "total_amount": "...",
    "paid_amount": "...",
    "outstanding_amount": "...",
    "status": "..."
  }
  ```
- [ ] Verify no type errors in console

### 4. File Uploads

#### Document Upload
- [ ] Navigate to Documents page
- [ ] Click "Upload Document"
- [ ] Select a file
- [ ] Fill form and submit
- [ ] Check Network tab: POST `/api/v1/documents/documents/`
- [ ] Verify FormData is sent (check Request Payload in Network tab)
- [ ] Verify upload succeeds

#### Gallery Work Upload
- [ ] Navigate to Gallery page
- [ ] Click "Upload Work"
- [ ] Select a file
- [ ] Fill form and submit
- [ ] Check Network tab: POST `/api/v1/gallery/works/`
- [ ] Verify FormData includes: owner, title, description, media, status, is_public
- [ ] Verify upload succeeds

#### Profile Picture Upload
- [ ] Navigate to Profile page
- [ ] Upload profile picture
- [ ] Check Network tab: Verify no explicit Content-Type header
- [ ] Verify upload succeeds

### 5. Data Type Verification

#### Decimal/Amount Fields
- [ ] Create/update invoice with amount
- [ ] Check Network tab: Verify amount sent as string (e.g., "1000.00" not 1000)
- [ ] Create discount with value
- [ ] Verify value sent as string

#### Date/Time Fields
- [ ] Create enrollment with dates
- [ ] Check Network tab: Verify dates in ISO 8601 format (e.g., "2024-01-01T10:00:00Z")
- [ ] Create session with start/end times
- [ ] Verify ISO 8601 format

#### Enum Values
- [ ] Create invoice with status
- [ ] Verify status sent as uppercase (e.g., "DRAFT" not "draft")
- [ ] Create payment with payment_method
- [ ] Verify enum value matches backend choices exactly

### 6. Error Handling

#### 404 Errors
- [ ] Check Network tab for any 404 errors
- [ ] All API calls should return 200, 201, or appropriate status codes
- [ ] No 404 errors should appear

#### 400 Errors (Bad Request)
- [ ] Try submitting forms with invalid data
- [ ] Verify proper error messages displayed
- [ ] Check Network tab: Should see 400 with error details

#### 401 Errors (Unauthorized)
- [ ] Logout
- [ ] Try accessing protected pages
- [ ] Verify redirect to login
- [ ] Verify token refresh works

#### 500 Errors (Server Error)
- [ ] Check Network tab for any 500 errors
- [ ] If found, check backend logs
- [ ] Verify error messages displayed to user

### 7. Pagination & Lists

#### List Endpoints
- [ ] Navigate to each list page (Users, Invoices, Payments, etc.)
- [ ] Check Network tab: Verify correct endpoint called
- [ ] Verify data loads correctly
- [ ] If pagination exists, test next/previous buttons

### 8. Search & Filters

#### Search Functionality
- [ ] Test search on each page with search capability
- [ ] Check Network tab: Verify search parameter sent correctly
- [ ] Verify results filtered correctly

#### Filter Functionality
- [ ] Test filters on each page
- [ ] Check Network tab: Verify filter parameters sent correctly
- [ ] Verify results filtered correctly

## Common Issues to Watch For

1. **Trailing Slash Issues**: Check all API calls have correct trailing slashes
2. **HTTP Method Mismatches**: Verify GET vs POST vs PATCH vs DELETE
3. **Payload Structure**: Verify payload matches backend expectations
4. **Response Type Mismatches**: Verify frontend handles response correctly
5. **File Upload Issues**: Verify FormData sent correctly, no Content-Type header issues
6. **Token Issues**: Verify tokens sent in Authorization header
7. **CORS Issues**: Check for CORS errors in console

## Success Criteria

- [ ] All API calls return 200/201 (no 404, 400, 500 errors)
- [ ] All file uploads work correctly
- [ ] All forms submit with correct payloads
- [ ] All downloads work correctly
- [ ] Authentication flows work correctly
- [ ] No console errors
- [ ] All pages load data correctly
- [ ] Search and filters work correctly

## Notes

- Keep Network tab open during all testing
- Check Console tab for any JavaScript errors
- Take screenshots of any errors
- Document any issues found




