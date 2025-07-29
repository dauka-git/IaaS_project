// server/scripts/createAdmin.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mastercard.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@mastercard.com');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@mastercard.com',
      password: 'Admin123!@#', // Change this to a secure password
      firstName: 'Mastercard',
      lastName: 'Admin',
      company: 'Mastercard',
      role: 'admin', // This is the key field
      phone: '+1234567890'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@mastercard.com');
    console.log('Password: Admin123!@#');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the script
createAdminUser();