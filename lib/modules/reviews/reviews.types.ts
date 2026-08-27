export interface Review {
  id: string;
  userId: string;
  movieId: string;
  reservationId: string;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  movieId: string;
  reservationId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export interface ReviewWithUser extends Review {
  user: {
    id: string;
    name: string;
    photoUrl?: string;
  };
}
