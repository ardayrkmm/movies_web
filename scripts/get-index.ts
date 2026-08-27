import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import getFirebaseAdmin from '../lib/firebase/admin';

async function testAllIndexes() {
  getFirebaseAdmin();
  const db = getFirestore();
  const urls: string[] = [];

  const runQuery = async (name: string, query: any) => {
    try {
      await query.get();
      // console.log(`[OK] ${name}`);
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

  // 1. Movies (Now Showing) - Already done by user, but let's include it
  await runQuery('Movies (status + releaseDate DESC)', db.collection('movies')
    .where('status', '==', 'NOW_SHOWING')
    .orderBy('releaseDate', 'desc')
  );

  // 2. Notifications
  await runQuery('Notifications (userId + createdAt DESC)', db.collection('notifications')
    .where('userId', '==', 'dummy')
    .orderBy('createdAt', 'desc')
  );
  await runQuery('Notifications (userId + isRead + createdAt DESC)', db.collection('notifications')
    .where('userId', '==', 'dummy')
    .where('isRead', '==', false)
    .orderBy('createdAt', 'desc')
  );

  // 3. Payments
  await runQuery('Payments (reservationId + createdAt DESC)', db.collection('payments')
    .where('reservationId', '==', 'dummy')
    .orderBy('createdAt', 'desc')
  );

  // 4. Reservations - Already done
  await runQuery('Reservations (userId + createdAt DESC)', db.collection('reservations')
    .where('userId', '==', 'dummy')
    .orderBy('createdAt', 'desc')
  );

  // 5. Reviews - Already done
  await runQuery('Reviews (movieId + createdAt DESC)', db.collection('reviews')
    .where('movieId', '==', 'dummy')
    .orderBy('createdAt', 'desc')
  );

  // 6. Seats
  await runQuery('Seats (studioId + row ASC + number ASC)', db.collection('seats')
    .where('studioId', '==', 'dummy')
    .orderBy('row', 'asc')
    .orderBy('number', 'asc')
  );

  // 7. Showtimes - Already done
  await runQuery('Showtimes (movieId + startAt ASC)', db.collection('showtimes')
    .where('movieId', '==', 'dummy')
    .where('startAt', '>=', Timestamp.fromDate(startOfDay))
    .where('startAt', '<=', Timestamp.fromDate(endOfDay))
    .orderBy('startAt', 'asc')
  );
  
  await runQuery('Showtimes (cinemaId + startAt ASC)', db.collection('showtimes')
    .where('cinemaId', '==', 'dummy')
    .where('startAt', '>=', Timestamp.fromDate(startOfDay))
    .where('startAt', '<=', Timestamp.fromDate(endOfDay))
    .orderBy('startAt', 'asc')
  );

  await runQuery('Showtimes Overlapping (studioId + endAt + startAt)', db.collection('showtimes')
    .where('studioId', '==', 'dummy')
    .where('endAt', '>', Timestamp.fromDate(startOfDay))
    .where('startAt', '<', Timestamp.fromDate(endOfDay))
  );

  // 8. Studios
  await runQuery('Studios (cinemaId + name ASC)', db.collection('studios')
    .where('cinemaId', '==', 'dummy')
    .orderBy('name', 'asc')
  );

  console.log("\n=== REQUIRED INDEXES ===");
  if (urls.length === 0) {
    console.log("All required indexes are already built!");
  } else {
    console.log(urls.join('\n'));
  }
}

testAllIndexes().catch(console.error);
