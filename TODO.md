# Project Cleanup and MongoDB Conversion TODO

## Phase 1: Code Cleanup
- [x] Analyze all files for unused/redundant code
- [x] Remove commented-out "Change Password" button in adminpanel.html
- [x] Remove unused CSS styles for change password modal in admin.css
- [x] Remove unused JavaScript code for password change modal in admin-panel.js

## Phase 2: MongoDB Conversion
- [ ] Create Mongoose models for all collections (Student, Teacher, Admin, ContactMessage)
- [ ] Update backend/db.js to use MongoDB connection instead of MySQL
- [ ] Rewrite backend/server.js to use Mongoose queries instead of MySQL
- [ ] Update package.json to include Mongoose dependency
- [ ] Remove MySQL-specific files (create-tables.js, seed-admin.js, etc.)
- [ ] Test all API endpoints to ensure they work with MongoDB
- [ ] Ensure data format remains the same for frontend compatibility

## Phase 3: Final Verification
- [ ] Verify all frontend functionality works with new backend
- [ ] Test admin login and panel functionality
- [ ] Test student and teacher registration
- [ ] Test contact form submission
- [ ] Ensure no breaking changes to frontend
