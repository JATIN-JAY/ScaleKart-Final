const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // ================= DB CONNECTION =================
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ================= CHECK EXISTING ADMIN =================
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      process.exit(0);
    }

    // ================= ENV-BASED CREDENTIALS =================
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@scalekarrt.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    if (!adminPassword || adminPassword.length < 8) {
      throw new Error('Admin password must be at least 8 characters');
    }

    // ================= CREATE ADMIN =================
    const admin = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('====================================');
    console.log('✅ ADMIN USER CREATED SUCCESSFULLY');
    console.log(`📧 Email: ${admin.email}`);
    console.log('🔐 Password: (hidden for security)');
    console.log('⚠️  Change password after first login');
    console.log('====================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
