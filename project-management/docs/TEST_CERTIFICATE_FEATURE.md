# Testing Certificate Delivery Tracking Feature

## ✅ Quick Test Checklist

### Backend Setup
```bash
cd Backend
npm run dev
```

### Test Scenario 1: First Time Certificate View

**Prerequisites:**
- [ ] Student has completed a course
- [ ] Admin has created a certificate for the student
- [ ] Certificate status is set to 'sent'
- [ ] Certificate has a valid certificateUrl

**Steps:**
1. [ ] Login as the student
2. [ ] Navigate to Dashboard (`/dashboard`)
3. [ ] Scroll to "Achievements" section
4. [ ] Locate the certificate
5. [ ] Click "View Certificate" button

**Expected Results:**
- [ ] Toast notification appears: "Certificate opened! Status updated to delivered."
- [ ] Certificate opens in a new browser tab
- [ ] In Admin Panel → Certificate Management:
  - [ ] Certificate status changes from 'sent' to 'delivered'
  - [ ] viewedByStudent flag is true
  - [ ] firstViewedDate is populated with current timestamp

**Backend Console Output:**
```
📜 Certificate CERT-XXXXXX-2025 viewed for the first time by student [Student Name]
✅ Certificate status automatically updated to 'delivered'
```

---

### Test Scenario 2: Subsequent Certificate Views

**Steps:**
1. [ ] Login as the same student
2. [ ] Navigate to Dashboard
3. [ ] Click "View Certificate" button again (2nd time)

**Expected Results:**
- [ ] No toast notification appears
- [ ] Certificate opens normally in new tab
- [ ] In Admin Panel:
  - [ ] Status remains 'delivered' (no change)
  - [ ] viewedByStudent remains true
  - [ ] firstViewedDate unchanged (same as before)

**Backend Console Output:**
```
(No special output - certificate already viewed)
```

---

### Test Scenario 3: Certificate Status Conditions

**Test 3a: Certificate with status 'issued'**
- [ ] Create certificate with status 'issued'
- [ ] Student views certificate
- [ ] Status should remain 'issued' (only changes from 'sent' to 'delivered')

**Test 3b: Certificate with status 'pending'**
- [ ] Certificate with status 'pending'
- [ ] Student views certificate
- [ ] Status should remain 'pending'

**Test 3c: Certificate with status 'delivered'**
- [ ] Certificate already 'delivered'
- [ ] Student views certificate
- [ ] Status remains 'delivered'

---

### Test Scenario 4: Security & Authorization

**Test 4a: Student views own certificate**
- [ ] Student A logs in
- [ ] Student A views their own certificate
- [ ] ✅ Success - certificate viewed

**Test 4b: Student tries to view another student's certificate**
- [ ] Student A logs in
- [ ] Student A tries to access Student B's certificate URL
- [ ] ❌ Should return 403 Forbidden
- [ ] Error message: "Not authorized to access this certificate"

---

### Test Scenario 5: API Endpoint Testing

**Using Postman/cURL:**

**Test 5a: Mark Certificate as Viewed (First Time)**
```bash
POST /api/certificates/{certificateId}/mark-viewed
Headers:
  Authorization: Bearer {student_token}

Expected Response:
{
  "success": true,
  "message": "Certificate marked as viewed and status updated to delivered",
  "certificate": {
    "_id": "...",
    "status": "delivered",
    "viewedByStudent": true,
    "firstViewedDate": "2025-11-09T..."
  },
  "firstView": true
}
```

**Test 5b: Mark Certificate as Viewed (Second Time)**
```bash
POST /api/certificates/{certificateId}/mark-viewed
Headers:
  Authorization: Bearer {student_token}

Expected Response:
{
  "success": true,
  "message": "Certificate already viewed",
  "certificate": {...},
  "firstView": false
}
```

**Test 5c: Unauthorized Access**
```bash
POST /api/certificates/{certificateId}/mark-viewed
Headers:
  Authorization: Bearer {different_student_token}

Expected Response (403):
{
  "success": false,
  "message": "Not authorized to access this certificate"
}
```

**Test 5d: Certificate Not Found**
```bash
POST /api/certificates/invalid_id/mark-viewed
Headers:
  Authorization: Bearer {student_token}

Expected Response (404):
{
  "success": false,
  "message": "Certificate not found"
}
```

---

## 🔍 Database Verification

### Check Certificate Status in MongoDB:

```javascript
// Connect to MongoDB
use SriKo

// Find certificates and check new fields
db.certificates.find({}, {
  certificateNumber: 1,
  status: 1,
  viewedByStudent: 1,
  firstViewedDate: 1
}).pretty()

// Find certificates that have been viewed
db.certificates.find({
  viewedByStudent: true
}).pretty()

// Find certificates sent but not yet viewed
db.certificates.find({
  status: 'sent',
  viewedByStudent: { $ne: true }
}).pretty()

// Find certificates delivered (viewed)
db.certificates.find({
  status: 'delivered'
}).pretty()
```

---

## 📊 Admin Panel Verification

### In Certificate Management Page:

**Check these columns/fields:**
- [ ] Status column shows 'delivered' for viewed certificates
- [ ] Status column shows 'sent' for unviewed certificates
- [ ] Filter by status works correctly
- [ ] Certificate details show viewed status

---

## 🐛 Common Issues & Troubleshooting

### Issue 1: Toast notification doesn't appear
**Check:**
- [ ] React Hot Toast is properly configured
- [ ] Browser console for errors
- [ ] Network tab shows successful API call

### Issue 2: Status doesn't change to 'delivered'
**Check:**
- [ ] Certificate status was 'sent' before viewing
- [ ] Backend logs show status update
- [ ] Database actually updated (check MongoDB)
- [ ] Admin panel refreshed after viewing

### Issue 3: Certificate doesn't open
**Check:**
- [ ] certificateUrl is valid
- [ ] File exists in uploads folder
- [ ] CORS settings allow file access
- [ ] Pop-up blocker not blocking new tab

### Issue 4: API returns 403 Forbidden
**Check:**
- [ ] Student is logged in
- [ ] Using correct student's token
- [ ] Certificate belongs to logged-in student
- [ ] Token not expired

---

## ✅ Success Criteria

The feature is working correctly when:

1. **First View:**
   - ✅ Toast appears
   - ✅ Status changes from 'sent' to 'delivered'
   - ✅ viewedByStudent = true
   - ✅ firstViewedDate is set
   - ✅ Certificate opens

2. **Subsequent Views:**
   - ✅ No toast
   - ✅ Status remains 'delivered'
   - ✅ Certificate opens normally

3. **Security:**
   - ✅ Students can only view their own certificates
   - ✅ Unauthorized access is blocked

4. **Admin Panel:**
   - ✅ Shows 'delivered' status
   - ✅ Can see which certificates have been viewed

---

## 📝 Test Report Template

```
Date: _______________
Tester: _______________

Test Scenario 1 (First View): 
  - Toast appeared: [ ] Pass [ ] Fail
  - Status changed: [ ] Pass [ ] Fail
  - Certificate opened: [ ] Pass [ ] Fail

Test Scenario 2 (Second View):
  - No toast: [ ] Pass [ ] Fail
  - Status unchanged: [ ] Pass [ ] Fail
  - Certificate opened: [ ] Pass [ ] Fail

Test Scenario 3 (Status Conditions):
  - Issued remains issued: [ ] Pass [ ] Fail
  - Pending remains pending: [ ] Pass [ ] Fail
  - Delivered remains delivered: [ ] Pass [ ] Fail

Test Scenario 4 (Security):
  - Own certificate works: [ ] Pass [ ] Fail
  - Other's certificate blocked: [ ] Pass [ ] Fail

Test Scenario 5 (API Endpoints):
  - First view API: [ ] Pass [ ] Fail
  - Second view API: [ ] Pass [ ] Fail
  - Unauthorized API: [ ] Pass [ ] Fail
  - Not found API: [ ] Pass [ ] Fail

Overall Status: [ ] All Tests Passed [ ] Some Tests Failed

Notes:
_______________________________________
_______________________________________
```

---

## 🎯 Ready for Production?

Before deploying to production:

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Database fields populated correctly
- [ ] Admin can see status changes
- [ ] Students receive proper feedback
- [ ] Security checks working
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Documentation complete

---

**Feature Status:** ✅ READY FOR TESTING

**Next Steps:**
1. Run all test scenarios
2. Fix any issues found
3. Get approval from stakeholders
4. Deploy to production

