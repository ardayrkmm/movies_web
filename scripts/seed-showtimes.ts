import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import getFirebaseAdmin from '../lib/firebase/admin';

async function seedShowtimes() {
  getFirebaseAdmin();
  const db = getFirestore();

  console.log('Fetching movies...');
  const moviesSnap = await db.collection('movies').get();
  if (moviesSnap.empty) {
    console.log('No movies found. Run seed.ts first.');
    return;
  }
  const movies = moviesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log('Seeding cinemas and studios...');
  const cinemaId = db.collection('cinemas').doc().id;
  await db.collection('cinemas').doc(cinemaId).set({
    name: 'CineReserve Premiere',
    slug: 'cinereserve-premiere',
    city: 'Jakarta',
    address: 'Jl. Sudirman No.1',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  const studio1Id = db.collection('studios').doc().id;
  await db.collection('studios').doc(studio1Id).set({
    cinemaId,
    name: 'Studio 1',
    seatCapacity: 10, // Small for testing
    type: 'REGULAR',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  const studio2Id = db.collection('studios').doc().id;
  await db.collection('studios').doc(studio2Id).set({
    cinemaId,
    name: 'Studio VIP',
    seatCapacity: 10,
    type: 'IMAX',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  console.log('Seeding seats...');
  const createSeats = async (studioId: string) => {
    for (let i = 1; i <= 5; i++) {
      await db.collection('seats').doc().set({
        studioId,
        label: `A${i}`,
        row: 'A',
        number: i,
        type: 'REGULAR',
        status: 'AVAILABLE',
        priceModifier: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await db.collection('seats').doc().set({
        studioId,
        label: `B${i}`,
        row: 'B',
        number: i,
        type: 'VIP',
        status: 'AVAILABLE',
        priceModifier: 20000,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  };
  await createSeats(studio1Id);
  await createSeats(studio2Id);

  console.log('Seeding showtimes for today and tomorrow...');
  const today = new Date();
  today.setHours(14, 0, 0, 0); // 14:00 today
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (const movie of movies) {
    // Showtime today 14:00
    const start1 = new Date(today);
    const end1 = new Date(start1.getTime() + 120 * 60000); // +2 hours
    await db.collection('showtimes').doc().set({
      movieId: movie.id,
      cinemaId,
      studioId: studio1Id,
      startAt: Timestamp.fromDate(start1),
      endAt: Timestamp.fromDate(end1),
      basePrice: 50000,
      status: 'SCHEDULED',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Showtime today 19:00
    const start2 = new Date(today);
    start2.setHours(19, 0, 0, 0);
    const end2 = new Date(start2.getTime() + 120 * 60000);
    await db.collection('showtimes').doc().set({
      movieId: movie.id,
      cinemaId,
      studioId: studio2Id,
      startAt: Timestamp.fromDate(start2),
      endAt: Timestamp.fromDate(end2),
      basePrice: 75000,
      status: 'SCHEDULED',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Showtime tomorrow 14:00
    const start3 = new Date(tomorrow);
    const end3 = new Date(start3.getTime() + 120 * 60000);
    await db.collection('showtimes').doc().set({
      movieId: movie.id,
      cinemaId,
      studioId: studio1Id,
      startAt: Timestamp.fromDate(start3),
      endAt: Timestamp.fromDate(end3),
      basePrice: 50000,
      status: 'SCHEDULED',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  console.log('Showtimes, Cinemas, and Studios seeded successfully!');
}

seedShowtimes().catch(console.error);
