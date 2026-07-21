import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  const r1 = await client.execute('SELECT isBestseller, COUNT(*) as cnt FROM Product WHERE isActive=1 GROUP BY isBestseller');
  console.log('Bestseller:', r1.rows);
  
  const r2 = await client.execute('SELECT isNew, COUNT(*) as cnt FROM Product WHERE isActive=1 GROUP BY isNew');
  console.log('New:', r2.rows);
  
  const r3 = await client.execute('SELECT isHotSelling, COUNT(*) as cnt FROM Product WHERE isActive=1 GROUP BY isHotSelling');
  console.log('Hot Selling:', r3.rows);
  
  const r4 = await client.execute('SELECT isTrending, COUNT(*) as cnt FROM Product WHERE isActive=1 GROUP BY isTrending');
  console.log('Trending:', r4.rows);
}

main().catch(console.error);