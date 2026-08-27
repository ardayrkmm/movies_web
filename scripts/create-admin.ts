import getFirebaseAdmin from '../lib/firebase/admin';
import { AuthService } from '../lib/modules/auth/auth.service';
import { UsersRepository } from '../lib/modules/users/users.repository';
import { getFirestore } from 'firebase-admin/firestore';

async function createAdmin() {
  getFirebaseAdmin();
  const db = getFirestore();
  const authService = new AuthService();
  const usersRepo = new UsersRepository();

  const adminEmail = 'admin@cinereserve.com';
  const adminPassword = 'password123';

  // Check if admin already exists
  const existing = await usersRepo.findByEmail(adminEmail);
  if (existing) {
    // Elevate to admin
    await db.collection('users').doc(existing.id).update({ role: 'ADMIN' });
    console.log(`User ${adminEmail} updated to ADMIN!`);
    console.log(`Login with email: ${adminEmail} and your existing password.`);
    return;
  }

  // Register user (defaults to USER role)
  console.log('Registering admin account...');
  const result = await authService.register({
    name: 'Super Admin',
    email: adminEmail,
    password: adminPassword,
    phone: '081234567890'
  });

  // Force update role to ADMIN directly in Firestore
  await db.collection('users').doc(result.user.id).update({ role: 'ADMIN' });
  
  console.log('Admin created successfully!');
  console.log('---');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('---');
}

createAdmin().catch(console.error);
