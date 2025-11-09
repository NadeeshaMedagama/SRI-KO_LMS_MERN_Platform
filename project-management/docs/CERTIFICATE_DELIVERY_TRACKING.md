# Certificate Delivery Tracking Feature

## Overview
This feature automatically tracks when a student views their certificate for the first time and updates the certificate status from "sent" to "delivered" in the admin panel.

## Implementation Details

### 1. Database Changes (Backend)

#### Certificate Model (`Backend/models/Certificate.js`)
Added two new fields to track certificate viewing:

```javascript
viewedByStudent: {
  type: Boolean,
  default: false
},
firstViewedDate: {
  type: Date
}
```

### 2. Backend API Endpoint

#### New Route: Mark Certificate as Viewed
**Endpoint:** `POST /api/certificates/:id/mark-viewed`
**Access:** Private (Student only)

**Functionality:**
- Verifies the certificate belongs to the requesting student
- Only updates on first view (idempotent operation)
- Automatically changes status from 'sent' to 'delivered' on first view
- Records the first viewed date
- Returns success with `firstView: true/false` flag

**Request:**
```javascript
POST /api/certificates/{certificateId}/mark-viewed
Headers: {
  Authorization: Bearer {token}
}
```

**Response (First View):**
```json
{
  "success": true,
  "message": "Certificate marked as viewed and status updated to delivered",
  "certificate": {
    "_id": "...",
    "status": "delivered",
    "viewedByStudent": true,
    "firstViewedDate": "2025-11-09T...",
    ...
  },
  "firstView": true
}
```

**Response (Subsequent Views):**
```json
{
  "success": true,
  "message": "Certificate already viewed",
  "certificate": {...},
  "firstView": false
}
```

### 3. Frontend Changes

#### Updated Files:

**1. `Frontend/src/services/apiService.ts`**
- Added `markCertificateAsViewed(certificateId)` method

**2. `Frontend/src/services/certificateService.js`**
- Added wrapper method for marking certificate as viewed

**3. `Frontend/src/pages/DashboardPage.jsx`**
- Changed "View Certificate" from a link to a button
- Added `handleViewCertificate()` function that:
  - Calls the mark-as-viewed endpoint
  - Shows success toast on first view
  - Updates local state to reflect status change
  - Opens certificate in new tab

## User Flow

### Student Perspective:
1. Student completes a course
2. Admin creates and sends the certificate (status: 'sent')
3. Student sees certificate in their dashboard
4. Student clicks "View Certificate" button for the first time
5. System shows toast: "Certificate opened! Status updated to delivered."
6. Certificate opens in new tab
7. Subsequent clicks just open the certificate (no status change)

### Admin Perspective:
1. Admin creates certificate for completed course
2. Admin uploads certificate file
3. Admin updates status to 'sent' and sends to student
4. Certificate appears in Certificate Management with status: 'sent'
5. When student views certificate for first time:
   - Status automatically changes to 'delivered'
   - Admin can see this change in Certificate Management
   - firstViewedDate is recorded

## Status Flow

```
pending → issued → sent → delivered
                    ↑           ↑
                    Admin    Student
                    Action   First View
```

## Security Features

1. **Authorization Check:** Student can only mark their own certificates as viewed
2. **Idempotent Operation:** Multiple clicks don't cause multiple status changes
3. **Status Validation:** Only updates to 'delivered' if current status is 'sent'
4. **Error Handling:** Certificate still opens even if marking as viewed fails

## Database Schema

```javascript
{
  student: ObjectId,
  course: ObjectId,
  certificateNumber: String,
  status: {
    type: String,
    enum: ['pending', 'issued', 'sent', 'delivered'],
    default: 'pending'
  },
  certificateUrl: String,
  emailSent: Boolean,
  emailSentDate: Date,
  viewedByStudent: Boolean,      // NEW
  firstViewedDate: Date,          // NEW
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/certificates/my-certificates` | Student | Get user's certificates |
| POST | `/api/certificates/:id/mark-viewed` | Student | Mark certificate as viewed (NEW) |
| GET | `/api/certificates` | Admin | Get all certificates |
| POST | `/api/certificates` | Admin | Create new certificate |
| PUT | `/api/certificates/:id/status` | Admin | Update certificate status |
| POST | `/api/certificates/:id/send` | Admin | Send certificate to student |
| DELETE | `/api/certificates/:id` | Admin | Delete certificate |

## Testing

### Manual Testing Steps:

1. **Setup:**
   - Ensure you have a user who completed a course
   - Create a certificate for that user via admin panel
   - Upload certificate file
   - Set status to 'sent'

2. **Test First View:**
   - Login as the student
   - Navigate to Dashboard
   - Find the certificate in "Achievements" section
   - Click "View Certificate" button
   - Verify toast appears: "Certificate opened! Status updated to delivered."
   - Certificate should open in new tab
   - Check admin panel - status should now be 'delivered'

3. **Test Subsequent Views:**
   - Click "View Certificate" again
   - No toast should appear
   - Certificate opens normally
   - Status remains 'delivered' (doesn't change)

### Backend Testing:

Run the test script:
```bash
cd Backend
node test-certificate-viewed.js
```

This will:
- List all certificates in the database
- Find a certificate with status 'sent'
- Simulate first view (status changes to 'delivered')
- Verify viewedByStudent flag is set
- Verify firstViewedDate is recorded

## Error Handling

1. **Certificate Not Found:** Returns 404
2. **Unauthorized Access:** Returns 403 (student trying to view another's certificate)
3. **Network Error:** Certificate still opens, but status may not update
4. **Database Error:** Logged and returns 500

## Benefits

1. **Tracking:** Admin can track certificate delivery completion
2. **Analytics:** Know which students have viewed their certificates
3. **Automation:** No manual status update needed
4. **User Experience:** Seamless for students (automatic)
5. **Audit Trail:** firstViewedDate provides timestamp

## Future Enhancements

Possible improvements:
- Email notification to admin when certificate is first viewed
- Analytics dashboard showing view statistics
- Reminder emails for unviewed certificates
- View count tracking (how many times viewed)
- Download tracking

## Files Modified

### Backend:
- `Backend/models/Certificate.js` - Added viewedByStudent and firstViewedDate fields
- `Backend/routes/certificateRoutes.js` - Added POST /:id/mark-viewed route

### Frontend:
- `Frontend/src/services/apiService.ts` - Added markCertificateAsViewed method
- `Frontend/src/services/certificateService.js` - Added wrapper method
- `Frontend/src/pages/DashboardPage.jsx` - Added handleViewCertificate handler

### Test Files:
- `Backend/test-certificate-viewed.js` - Test script for the feature

## Backward Compatibility

- Existing certificates without the new fields will have:
  - `viewedByStudent: false` (default)
  - `firstViewedDate: undefined`
- Feature works seamlessly with existing data
- No migration needed

## Conclusion

This feature provides automatic tracking of certificate delivery without requiring any manual intervention from admins or students. It enhances the LMS by providing visibility into certificate engagement and completion of the delivery process.

