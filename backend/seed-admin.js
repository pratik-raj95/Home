require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const Admin = require('./models/Admin');

(async () => {
  try {
    await connectDB();

    const username = 'admin';
    const password = 'admin123';

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      username,
      password_hash: hashedPassword
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
})();
