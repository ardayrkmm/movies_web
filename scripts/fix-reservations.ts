import { getFirestore } from 'firebase-admin/firestore';
import getFirebaseAdmin from '../lib/firebase/admin';

async function fixReservations() {
  getFirebaseAdmin();
  const db = getFirestore();
  const resSnap = await db.collection('reservations').get();
  
  const batch = db.batch();
  let count = 0;
  
  for (const doc of resSnap.docs) {
    const data = doc.data();
    if (data.total === 0 || data.total > 1000000) {
      batch.update(doc.ref, { 
        total: 100000,
        subtotal: 100000
      });
      count++;
    }
  }
  
  if (count > 0) {
    await batch.commit();
  }
  
  console.log(`Fixed ${count} reservations!`);
}

fixReservations().catch(console.error);
