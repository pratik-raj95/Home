# Project Cleanup and MongoDB Conversion TODO

## Phase 1: Code Cleanup
- [x] Analyze all files for unused/redundant code
- [x] Remove commented-out "Change Password" button in adminpanel.html
- [x] Remove unused CSS styles for change password modal in admin.css
- [x] Remove unused JavaScript code for password change modal in admin-panel.js
- [x] Remove change password functionality from adminlogin.html
- [x] Restore change password functionality and fix error "Username, old and new password are required!"

## Phase 2: MongoDB Conversion
- [x] Create Mongoose models for all collections (Student, Teacher, Admin, ContactMessage)
- [x] Update backend/db.js to use MongoDB connection instead of MySQL
- [x] Rewrite backend/server.js to use Mongoose queries instead of MySQL
- [x] Update package.json to include Mongoose dependency
- [x] Remove MySQL-specific files (alter-tables.js, check-columns.js, create-tables-new.js, create-tables.js, drop-student-fields.js, drop-teacher-area.js)
- [x] Test all API endpoints to ensure they work with MongoDB
- [x] Ensure data format remains the same for frontend compatibility

## Phase 3: Final Verification
- [ ] Verify all frontend functionality works with new backend
- [ ] Test admin login and panel functionality
- [ ] Test student and teacher registration
- [ ] Test contact form submission
- [ ] Ensure no breaking changes to frontend
