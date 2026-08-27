import { getFirestore } from 'firebase-admin/firestore';
import getFirebaseAdmin from '../lib/firebase/admin';

async function fixSeats() {
  getFirebaseAdmin();
  const db = getFirestore();
  const seatsSnap = await db.collection('seats').get();
  
  const batch = db.batch();
  let count = 0;
  
  for (const doc of seatsSnap.docs) {
    const data = doc.data();
    let updated = false;
    let newModifier = data.priceModifier;
    
    if (data.priceModifier === 0) {
      newModifier = 1.0;
      updated = true;
    } else if (data.priceModifier > 10) {
      newModifier = 1.5;
      updated = true;
    }
    
    if (updated) {
      batch.update(doc.ref, { priceModifier: newModifier });
      count++;
      
      if (count % 400 === 0) {
        await batch.commit();
        console.log(`Committed ${count} updates...`);
      }
    }
  }
  
  if (count % 400 !== 0 && count > 0) {
    await batch.commit();
  }
  
  console.log(`Fixed ${count} seats!`);
}

fixSeats().catch(console.error);
