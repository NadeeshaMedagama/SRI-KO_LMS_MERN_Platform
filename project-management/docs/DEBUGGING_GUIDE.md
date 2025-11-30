# Debugging Guide for "Invalid Plan Selected" Error

## Current Status
Added extensive logging to help identify where the error is occurring.

## How to Debug

### 1. Open Browser Developer Tools
- Press F12 or right-click and select "Inspect"
- Go to the "Console" tab

### 2. Reproduce the Error
1. Navigate to `/pricing` page
2. Click on "Start Pro Trial" button
3. Watch the console output

### 3. Check the Console Logs

You should see logs in this order:

#### When Loading Payment Page:
```
🔍 Fetching subscription data...
📋 Plan from URL: pro
📋 Billing cycle from URL: monthly  (or yearly)
📡 Calling apiService.getSubscriptionPlans()...
📦 Received plans from API: [...]
✅ Returning from getPlans(): { success: true, data: [...] }
✅ Plans received: { success: true, data: [...] }
📦 Plans data: [...]
🔎 Comparing plan "starter" with "pro"
🔎 Comparing plan "pro" with "pro"
🎯 Selected plan: { name: "pro", ... }
```

#### When Clicking Pay Button:
```
💳 Starting payment process...
📋 Plan: pro
📋 Billing Cycle: monthly
💰 Amount: 15000
📦 Creating subscription with: { plan: "pro", billingCycle: "monthly" }
🔐 Checking authentication...
📡 Calling API: POST http://localhost:5000/api/subscriptions/create
📦 Request body: { plan: "pro", billingCycle: "monthly" }
📨 API Response: { success: true, subscription: {...} }
📊 Response status: 201
✅ Subscription created successfully
...
```

### 4. Identify Where the Error Occurs

#### A. Error: "Invalid plan selected" appears BEFORE clicking Pay
**Problem**: Plan is not being found in the API response
**Look for**:
- What does `📋 Plan from URL:` show?
- What does `📦 Plans data:` show?
- Do you see `🔎 Comparing` logs?
- What does `🎯 Selected plan:` show?

**Possible causes**:
1. URL parameter is wrong (e.g., "Pro" instead of "pro")
2. API is returning empty/wrong data
3. Network issue preventing API call

#### B. Error appears AFTER clicking Pay button
**Problem**: Backend is rejecting the subscription creation
**Look for**:
- `📡 Calling API: POST ...` log
- `📦 Request body:` - check if plan and billingCycle are correct
- `📨 API Response:` - check the error message
- `📊 Response status:` - check if it's 400 (validation error)

**Possible causes**:
1. User not authenticated (401 error)
2. Plan name mismatch (400 error with "Invalid plan selected")
3. User already has active subscription
4. Backend validation failing

### 5. Common Fixes

#### Fix 1: URL Parameter Issue
If URL shows `plan=Pro` instead of `plan=pro`:
- Check PricingPage.jsx line 149
- Should be: `plan=${plan.name.toLowerCase()}`

#### Fix 2: API Not Reachable
If you see network errors:
- Check if backend is running on port 5000
- Check if `window.configs.apiUrl` is set correctly
- Try accessing http://localhost:5000/api/subscriptions/plans directly

#### Fix 3: Authentication Issue
If you see "Authentication required" error:
- Make sure you're logged in
- Check if localStorage has 'token' or 'adminToken'
- Try logging out and logging in again

#### Fix 4: Backend Validation Error
If backend returns "Invalid plan selected":
- Check what value is being sent in the request body
- Compare with backend validation rules (should accept: 'starter', 'pro', 'premium')
- Case sensitivity matters! Must be lowercase

### 6. Manual Testing

#### Test 1: Check if plans API works
Open a new browser tab and go to:
```
http://localhost:5000/api/subscriptions/plans
```

You should see:
```json
{
  "success": true,
  "data": [
    {
      "name": "starter",
      "displayName": "Starter",
      ...
    },
    {
      "name": "pro",
      "displayName": "Pro",
      ...
    },
    {
      "name": "premium",
      "displayName": "Premium",
      ...
    }
  ]
}
```

#### Test 2: Check authentication
In browser console, run:
```javascript
console.log('Token:', localStorage.getItem('token') || localStorage.getItem('adminToken'));
```

Should show a JWT token, not null.

#### Test 3: Check URL parameters
On the payment page, run in console:
```javascript
const params = new URLSearchParams(window.location.search);
console.log('Plan:', params.get('plan'));
console.log('Billing:', params.get('billing'));
```

Should show:
```
Plan: pro
Billing: monthly
```

### 7. Backend Logs

Also check the backend terminal for errors. You should see:
- POST /api/subscriptions/create requests
- Any error messages
- Validation errors with details

### 8. Quick Test Script

Run this in your browser console on the payment page:
```javascript
// Quick diagnostic test
console.log('=== DIAGNOSTIC TEST ===');
console.log('Current URL:', window.location.href);

const params = new URLSearchParams(window.location.search);
console.log('Plan param:', params.get('plan'));
console.log('Billing param:', params.get('billing'));

console.log('Auth token exists:', !!(localStorage.getItem('token') || localStorage.getItem('adminToken')));

console.log('API URL:', window?.configs?.apiUrl || 'http://localhost:5000');

// Try to fetch plans
fetch((window?.configs?.apiUrl || 'http://localhost:5000') + '/api/subscriptions/plans')
  .then(r => r.json())
  .then(data => console.log('Plans API response:', data))
  .catch(err => console.error('Plans API error:', err));
```

## Expected Behavior

✅ **What should work**:
1. URL: `/payment?plan=pro&billing=monthly`
2. Plans API returns 3 plans with names: "starter", "pro", "premium"
3. Payment page finds and displays "pro" plan details
4. User clicks "Fill Demo Card" to auto-fill card details
5. User clicks "Pay" button
6. Backend creates subscription for "pro" plan
7. Payment record is created and completed
8. User is redirected to dashboard

## If All Else Fails

1. Clear browser cache and localStorage
2. Restart backend server
3. Restart frontend dev server
4. Try in incognito/private browsing mode
5. Check browser console for any other JavaScript errors
6. Check network tab for failed API calls

