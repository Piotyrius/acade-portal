# Fix 404 Errors on Refresh - Render Static Site

## Problem
When you refresh any route (like `/catalog/programs`), you get a 404 error because the server is looking for a file at that path instead of serving `index.html`.

## Solution: Configure Redirects in Render Dashboard

**This is the REQUIRED solution for Render static sites.**

### Step-by-Step Instructions:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Log in to your account

2. **Select Your Static Site**
   - Click on your static site service: `acade-portal`

3. **Open Settings**
   - Click on the **Settings** tab

4. **Find Redirects Section**
   - Scroll down to find **Redirects/Rewrites** or **Custom Redirects** section
   - If you don't see it, look for **Advanced Settings** or **Build & Deploy** settings

5. **Add Redirect Rule**
   - Click **Add Redirect** or **Add Rewrite**
   - Configure:
     ```
     Source: /*
     Destination: /index.html
     Status Code: 200
     ```
   - **CRITICAL**: Use status code **200**, NOT 301 or 302
   - Status 200 returns the file without changing the URL (allows React Router to work)
   - Status 301/302 would redirect and change the URL (breaks React Router)

6. **Save and Redeploy**
   - Click **Save**
   - Go to **Manual Deploy** or trigger a new deployment
   - The redirect won't work until you redeploy

## Alternative: If Redirects Section Not Available

If you don't see a Redirects section in Render:

1. **Check Render Documentation**
   - Visit: https://render.com/docs/static-sites
   - Look for SPA routing configuration

2. **Contact Render Support**
   - They can help configure redirects for your static site
   - Mention you need SPA routing for React Router

3. **Consider Using HashRouter (Temporary)**
   - As a last resort, you could switch to `HashRouter` in `src/App.tsx`
   - This uses URLs like `/#/catalog/programs` instead of `/catalog/programs`
   - Not ideal for SEO, but works without server configuration

## Testing

After configuring the redirect:

1. Deploy your site
2. Navigate to any route (e.g., `/catalog/programs`)
3. Refresh the page (F5 or Ctrl+R)
4. The page should load correctly without 404 errors
5. The URL should remain the same (no redirect happening)

## Why This Happens

- React Router uses client-side routing (BrowserRouter)
- When you refresh, the browser asks the server for that specific path
- The server doesn't have a file at `/catalog/programs`, so it returns 404
- The redirect tells the server: "For any path, serve index.html"
- React Router then handles the routing on the client side

