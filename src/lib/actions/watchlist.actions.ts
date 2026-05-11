'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection not established');
    }

    // Find user by email in the user collection (Better Auth)
    const user = await db.collection('user').findOne(
      { email },
      { projection: { _id: 1, id: 1 } }
    );

    if (!user) {
      return [];
    }

    const userId = user.id || user._id.toString();

    // Query the Watchlist by userId, return just the symbols as strings
    const watchlistItems = await Watchlist.find({ userId }, { symbol: 1 }).lean();

    return watchlistItems.map((item) => item.symbol);
  } catch (error) {
    console.error('Error fetching watchlist symbols by email:', error);
    return [];
  }
};
