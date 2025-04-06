require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { faker } = require('@faker-js/faker');

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Doctor User',
        email: 'doctor@example.com',
        password: 'doctor123',
        role: 'doctor',
      },
      {
        name: 'Staff User',
        email: 'staff@example.com',
        password: 'staff123',
        role: 'staff',
      },
    ];

    // Check for existing users
    const existingCount = await User.countDocuments();
    console.log(`Found ${existingCount} existing users`);

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users cleared');

    // Create new users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({
          ...user,
          password: hashedPassword,
        });
      })
    );

    console.log(`${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Allow the script to be run directly or imported
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      console.log('Connected to MongoDB Atlas');
      await seedUsers();
      console.log('Users seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = seedUsers; 