import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import getFirebaseAdmin from '../lib/firebase/admin';

async function seed() {
  console.log('Initialize Admin...');
  getFirebaseAdmin(); // ensures admin is initialized
  const db = getFirestore();

  console.log('Seeding genres...');
  const genres = [
    { name: 'Action', slug: 'action' },
    { name: 'Comedy', slug: 'comedy' },
    { name: 'Drama', slug: 'drama' }
  ];

  const genreIds = [];
  for (const genre of genres) {
    const docRef = db.collection('genres').doc();
    genreIds.push(docRef.id);
    await docRef.set({
      ...genre,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
  console.log('Genres seeded with IDs:', genreIds);

  console.log('Seeding movies...');
  const movies = [
    {
      title: 'Transformers: Rise of the Beasts',
      slug: 'transformers-rise-of-the-beasts',
      description: 'Autobots must team up with a new faction of Transformers to save Earth.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gPbM0MK8CP8A174rmUwGsADNYKD.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/bz66a19bR6BKsbY8gSZCM4etJiK.jpg',
      trailerUrl: 'https://youtube.com',
      duration: 127,
      releaseDate: '2023-06-09',
      ageRating: 'PG-13',
      language: 'English',
      status: 'NOW_SHOWING',
      genres: [genreIds[0]]
    },
    {
      title: 'Spider-Man: Across the Spider-Verse',
      slug: 'spiderman-across-the-spider-verse',
      description: 'Miles Morales catapults across the Multiverse.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
      trailerUrl: 'https://youtube.com',
      duration: 140,
      releaseDate: '2023-06-02',
      ageRating: 'PG',
      language: 'English',
      status: 'NOW_SHOWING',
      genres: [genreIds[0], genreIds[1]]
    },
    {
      title: 'Oppenheimer',
      slug: 'oppenheimer',
      description: 'The story of J. Robert Oppenheimer and the development of the atomic bomb.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
      trailerUrl: 'https://youtube.com',
      duration: 180,
      releaseDate: '2023-07-21',
      ageRating: 'R',
      language: 'English',
      status: 'NOW_SHOWING',
      genres: [genreIds[2]]
    },
    {
      title: 'Barbie',
      slug: 'barbie',
      description: 'Barbie suffers a crisis that leads her to question her world and her existence.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/ctMserH8g2SeOAnCw5gFjdQF8mo.jpg',
      trailerUrl: 'https://youtube.com',
      duration: 114,
      releaseDate: '2023-07-21',
      ageRating: 'PG-13',
      language: 'English',
      status: 'NOW_SHOWING',
      genres: [genreIds[1]]
    }
  ];

  for (const movie of movies) {
    const docRef = db.collection('movies').doc();
    await docRef.set({
      ...movie,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
  console.log('Movies seeded successfully!');
}

seed().catch(console.error);
