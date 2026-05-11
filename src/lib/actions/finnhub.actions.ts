'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

const fetchJSON = async (
  url: string,
  revalidateSeconds?: number
): Promise<any> => {
  const fetchOptions: RequestInit = {
    headers: {
      'X-Finnhub-Token': FINNHUB_API_KEY || '',
    },
  };

  if (revalidateSeconds !== undefined) {
    fetchOptions.cache = 'force-cache';
    fetchOptions.next = { revalidate: revalidateSeconds };
  } else {
    fetchOptions.cache = 'no-store';
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(
      `Finnhub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export const getNews = async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
  try {
    const { from, to } = getDateRange(5);
    const articles: MarketNewsArticle[] = [];
    const seenIds = new Set<string | number>();

    if (symbols && symbols.length > 0) {
      // Clean and uppercase symbols
      const cleanedSymbols = symbols
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

      if (cleanedSymbols.length === 0) {
        // Fallback to general market news if all symbols are invalid
        return getNews();
      }

      // Loop max 6 times, round-robin through symbols
      for (let round = 0; round < 6; round++) {
        for (const symbol of cleanedSymbols) {
          if (articles.length >= 6) break;

          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&limit=10`;
            const data = await fetchJSON(url, 3600); // Cache for 1 hour

            if (data && Array.isArray(data)) {
              // Find one valid article from this symbol in this round
              for (const article of data) {
                if (
                  validateArticle(article as RawNewsArticle) &&
                  !seenIds.has(article.url)
                ) {
                  seenIds.add(article.url);
                  articles.push(
                    formatArticle(article as RawNewsArticle, true, symbol)
                  );
                  break; // One per round per symbol
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching news for ${symbol}:`, error);
            // Continue to next symbol
          }

          if (articles.length >= 6) break;
        }

        if (articles.length >= 6) break;
      }

      // Sort by datetime descending and take top 6
      articles.sort((a, b) => b.datetime - a.datetime);
      return articles.slice(0, 6);
    } else {
      // Fetch general market news
      try {
        const url = `${FINNHUB_BASE_URL}/news?category=general&minId=0&limit=100`;
        const data = await fetchJSON(url, 3600); // Cache for 1 hour

        if (data && Array.isArray(data)) {
          for (const article of data) {
            if (validateArticle(article as RawNewsArticle)) {
              const id = `${article.id || article.url}`;
              const headline = article.headline || '';
              const url = article.url || '';

              // Deduplicate by id/url/headline
              const key = `${article.id}-${headline}-${url}`;
              if (!seenIds.has(key)) {
                seenIds.add(key);
                articles.push(formatArticle(article as RawNewsArticle, false));
              }

              if (articles.length >= 6) break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching general news:', error);
      }

      return articles.slice(0, 6);
    }
  } catch (error) {
    console.error('Error in getNews:', error);
    throw new Error('Failed to fetch news');
  }
};
