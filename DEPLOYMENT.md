# Deployment Guide

## Frontend Deployment on Render

### Required Environment Variables

In your Render Static Site settings, add the following environment variable:

**`VITE_API_BASE_URL`** - Your backend API URL
- Example: `https://academy-crm.onrender.com`
- This should be the full URL of your Django backend (without trailing slash)

### Steps to Configure:

1. Go to your Render dashboard
2. Select your Static Site service (`acade-portal`)
3. Go to **Environment** tab
4. Add environment variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.onrender.com` (replace with your actual backend URL)
5. Save and redeploy

### Important Notes:

- Environment variables starting with `VITE_` are embedded at build time
- After adding/changing `VITE_API_BASE_URL`, you **must redeploy** the frontend
- The value must be the full URL including `https://`

## Backend Deployment on Render

### Required Environment Variables

Make sure your backend has these environment variables set:

**`CORS_ALLOWED_ORIGINS`** - Comma-separated list of frontend origins
- Example: `https://acade-portal.onrender.com,https://your-custom-domain.com`
- This allows your frontend to make API requests

**`ALLOWED_HOSTS`** - Comma-separated list of allowed hostnames
- Example: `academy-crm.onrender.com,your-custom-domain.com`
- Or leave empty to auto-detect from Render

**`FRONTEND_URL`** - Frontend URL for password reset links
- Example: `https://acade-portal.onrender.com`
- Used when sending password reset emails

### Steps to Configure:

1. Go to your Render dashboard
2. Select your Web Service (Django backend)
3. Go to **Environment** tab
4. Add/update environment variables:
   - `CORS_ALLOWED_ORIGINS`: `https://acade-portal.onrender.com`
   - `FRONTEND_URL`: `https://acade-portal.onrender.com`
   - `ALLOWED_HOSTS`: (optional, auto-detected if on Render)
5. Save and redeploy

## Troubleshooting

### Issue: Frontend can't connect to backend

**Symptoms:**
- Network errors in browser console
- CORS errors
- Requests going to `localhost:8000` instead of backend URL

**Solutions:**
1. Check that `VITE_API_BASE_URL` is set in Render environment variables
2. Verify the backend URL is correct (test in browser)
3. Check browser console for the logged API Base URL
4. Redeploy frontend after setting environment variable

### Issue: CORS errors

**Symptoms:**
- Browser console shows CORS policy errors
- Preflight OPTIONS requests fail

**Solutions:**
1. Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL
2. Check that the frontend URL matches exactly (including `https://`)
3. Verify backend is deployed and accessible
4. Check backend logs for CORS-related errors

### Issue: No logs in backend

**Symptoms:**
- Frontend makes requests but backend doesn't receive them
- No logs appear in Render backend logs

**Solutions:**
1. Verify the API URL is correct (check browser console)
2. Check that requests are going to the backend URL, not localhost
3. Verify backend is running and accessible
4. Check Render backend logs for any errors
5. Test backend URL directly in browser: `https://your-backend.onrender.com/api/v1/auth/login/`

## SPA Routing (404 on Refresh)

If you get 404 errors when refreshing pages (like `/login`), this is because the server is looking for a file at that path instead of serving `index.html`.

### Solution 1: Using _redirects File (Recommended)

The `public/_redirects` file is already configured to handle this. It tells Render to serve `index.html` for all routes so React Router can handle client-side routing.

The file contains:
```
/*    /index.html   200
```

This ensures all routes return `index.html` with a 200 status code (not a redirect), allowing React Router to handle the routing.

**Note:** After deploying, if you still get 404 errors, try Solution 2.

### Solution 2: Configure in Render Dashboard (REQUIRED)

**Render requires you to configure redirects through their dashboard.** The `_redirects` file may not work automatically. Follow these steps:

1. Go to your [Render dashboard](https://dashboard.render.com)
2. Select your Static Site service (`acade-portal`)
3. Go to **Settings** tab
4. Scroll down to find **Redirects/Rewrites** section
5. Click **Add Redirect** or **Add Rewrite**
6. Configure the redirect:
   - **Source Path**: `/*` (matches all paths)
   - **Destination**: `/index.html`
   - **Status Code**: `200` (IMPORTANT: Use 200, not 301 or 302)
   - **Force**: Leave unchecked (or check if available)
7. Click **Save**
8. **Redeploy your site** (the redirect won't take effect until you redeploy)

**Why Status Code 200?**
- Using 200 (not 301/302) means the server returns `index.html` without changing the URL
- This allows React Router to handle the routing on the client side
- Using 301/302 would cause the URL to change, breaking the routing

**After Configuration:**
- Test by refreshing any route (e.g., `/catalog/programs`)
- The page should load correctly without 404 errors
- The URL should remain the same (no redirect)

## Testing the Connection

1. Open browser console on your deployed frontend
2. Look for: `🌐 API Base URL: https://your-backend-url.onrender.com`
3. If it shows `localhost:8000`, the environment variable is not set correctly
4. Try logging in and check the Network tab for the actual request URL
5. Test refreshing pages - they should work without 404 errors


