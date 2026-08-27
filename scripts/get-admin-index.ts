import { getFirestore, AggregateField, Timestamp } from 'firebase-admin/firestore';
import getFirebaseAdmin from '../lib/firebase/admin';

async function testAdminIndexes() {
  getFirebaseAdmin();
  const db = getFirestore();
  const urls: string[] = [];

  const runQuery = async (name: string, query: any) => {
    try {
      await query.get();
    } catch (err: any) {
      if (err.message.includes('FAILED_PRECONDITION') || err.message.includes('requires an index')) {
        const urlMatch = err.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
        if (urlMatch) {
          urls.push(`- **${name}**: ${urlMatch[0]}`);
        } else {
          console.log(`[!] ${name} needs an index but no URL found: ${err.message}`);
        }
      } else {
         console.log(`[Error] ${name}: ${err.message}`);
      }
    }
  };

  const startOfDay = new Date();
  startOfDay.setUTCHours(0,0,0,0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23,59,59,999);

  // 1. Dashboard Stats (status + total sum)
  await runQuery('Dashboard Stats (status + aggregate total)', db.collection('reservations')
    .where("status", "==", "PAID")
    .aggregate({ totalRevenue: AggregateField.sum("total") })
  );

  // 2. Dashboard Revenue Range (status + createdAt ASC)
  await runQuery('Dashboard Revenue (status + createdAt ASC)', db.collection('reservations')
    .where("status", "==", "PAID")
    .where("createdAt", ">=", Timestamp.fromDate(startOfDay))
    .where("createdAt", "<=", Timestamp.fromDate(endOfDay))
    .aggregate({ totalRevenue: AggregateField.sum("total") })
  );

  // 3. Dashboard Popular Movies (rating DESC + reviewCount DESC)
  await runQuery('Popular Movies (rating DESC + reviewCount DESC)', db.collection('movies')
    .orderBy("rating", "desc")
    .orderBy("reviewCount", "desc")
  );
  
  // 4. Admin Reservations List (createdAt DESC) - usually built-in, but let's check
  // (In admin/dashboard/reservations/route.ts, it calls getPaginatedCollection which we already indexed)

  console.log("\n=== REQUIRED ADMIN INDEXES ===");
  if (urls.length === 0) {
    console.log("All admin indexes are already built!");
  } else {
    console.log(urls.join('\n'));
  }
}

testAdminIndexes().catch(console.error);
