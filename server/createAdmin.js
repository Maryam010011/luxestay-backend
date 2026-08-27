/**
 * createAdmin.js — One-time Admin Account Creation Script
 *
 * Run this ONCE to create the first admin account:
 *   node server/createAdmin.js
 *
 * This is the ONLY safe way to create an admin account.
 * The public /api/auth/register endpoint always creates "customer" accounts.
 */

import readline from 'readline';
import { connectDB } from './config/db.js';
import { UserModel } from './models/User.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function createAdmin() {
  console.log('\n🔐 LuxeStay — Admin Account Creation Script');
  console.log('─'.repeat(50));

  try {
    console.log('Connecting to MongoDB Atlas...');
    await connectDB();
    console.log('✅ Connected.\n');

    const name = (await prompt('Enter admin name: ')).trim();
    const email = (await prompt('Enter admin email: ')).trim().toLowerCase();
    const password = (await prompt('Enter admin password (min 6 chars): ')).trim();

    if (!name || !email || !password) {
      console.error('❌ All fields are required.');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters.');
      process.exit(1);
    }

    // Check if email already exists
    const existing = await UserModel.findOne({ email });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`⚠️  An admin account with email "${email}" already exists.`);
      } else {
        // Upgrade existing customer to admin
        existing.role = 'admin';
        await existing.save();
        console.log(`✅ Existing user "${email}" has been upgraded to admin role.`);
      }
      rl.close();
      process.exit(0);
    }

    const admin = await UserModel.create({
      name,
      email,
      password,  // Pre-save hook in User.js will hash this automatically
      role: 'admin',
    });

    console.log('\n✅ Admin account created successfully!');
    console.log('─'.repeat(50));
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log(`   ID:    ${admin._id}`);
    console.log('─'.repeat(50));
    console.log('\nYou can now log in at /login with these credentials.\n');
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();
