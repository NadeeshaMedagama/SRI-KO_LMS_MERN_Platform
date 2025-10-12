# Testing Tools & Files

This directory contains all testing tools, debug files, and solution files for the SRI-KO LMS project.

## 📁 Directory Structure

### `debug-tools/`
Contains HTML files for debugging and testing the application:

- **`frontend-backend-test.html`** - Comprehensive test for both backend and frontend connections
- **`frontend-debug.html`** - Debug tool for frontend issues with iframe preview
- **`frontend-api-debug.html`** - API debugging tool
- **`frontend-blank-page-*.html`** - Files related to fixing the blank page issue
- **`frontend-url-fix.html`** - URL fixing solutions
- **`debug-admin.html`** - Admin panel debugging tool

### `html-tests/`
Contains HTML test files for specific functionality:

- **`admin-test.html`** - Admin functionality tests
- **`test-admin-login.html`** - Admin login testing
- **`test-user-dashboard.html`** - User dashboard testing
- **`test-why-choose-page.html`** - Why Choose SRI-KO page testing

### `solutions/`
Contains HTML files with solutions to various issues:

- **`profile-*.html`** - Profile-related solutions and fixes
- **`color-update-preview.html`** - Color scheme update previews

### Root Files
- **`SRI-KO_LMS_Postman_Collection.json`** - Complete Postman collection for API testing

## 🚀 How to Use

### 1. Backend & Frontend Testing
Open `debug-tools/frontend-backend-test.html` in your browser to:
- Test backend connection (port 5000)
- Test frontend connection (port 5173/5174)
- Test API endpoints
- Get comprehensive status report

### 2. Frontend Debugging
Open `debug-tools/frontend-debug.html` in your browser to:
- Preview the frontend in an iframe
- Test resource loading
- Check for console errors
- Get quick status updates

### 3. API Testing
Use the Postman collection (`SRI-KO_LMS_Postman_Collection.json`) to:
- Test all API endpoints
- Verify authentication
- Test CRUD operations
- Validate responses

### 4. Specific Feature Testing
Use individual HTML test files to test specific features:
- Admin functionality
- User dashboard
- Profile management
- Page-specific features

## 🔧 Troubleshooting

### Common Issues
1. **Blank Page**: Use `frontend-blank-page-*.html` files
2. **API Connection**: Use `frontend-api-debug.html`
3. **Admin Issues**: Use `debug-admin.html`
4. **Profile Issues**: Use `solutions/profile-*.html` files

### Debug Steps
1. Open the appropriate debug tool
2. Check the browser console (F12)
3. Verify server status
4. Test individual components
5. Review error messages

## 📝 Notes

- All HTML files are self-contained and can be opened directly in a browser
- Make sure both backend (port 5000) and frontend (port 5173/5174) are running
- Some files may require specific user permissions or authentication
- Debug tools are designed for development and testing purposes

## 🔄 Updates

- **2025-10-05**: Organized all test files into proper directories
- **2025-10-05**: Created comprehensive testing documentation
- **2025-10-05**: Fixed frontend blank page issues
- **2025-10-05**: Added new debug tools for better troubleshooting
