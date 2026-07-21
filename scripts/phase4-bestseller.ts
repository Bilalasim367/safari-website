import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  console.log('=== PHASE 4: Set Bestseller Flags ===');
  
  // Get all active products
  const result = await client.execute('SELECT id, name, gender, isBestseller FROM Product WHERE isActive = 1');
  const products = result.rows;
  console.log(`Total active products: ${products.length}`);
  
  // Define bestseller products (keep existing 5 + add ~5 popular classics)
  const bestsellerNames = [
    // Existing bestsellers
    'Safari Midnight', 'Safari Rose', 'Safari Citrus', 'Safari Noir', 'Safari Sand',
    // Popular classics
    'Acqua Di Gio', 'Acqua Di Gio Profumo', 'Acqua Di Gio Profondo', 'Acqua Di Gio Absolu',
    'Cool Water', 'Davidoff Cool Water',
    'Bleu De Chanel', 'Bleu De Chanel Parfum', 'Bleu De Chanel Eau De Parfum', 'Bleu De Chanel Eau De Toilette',
    'Sauvage By Dior', 'Dior Sauvage', 'Dior Sauvage Elixir', 'Dior Sauvage Parfum',
    'Aventus', 'Creed Aventus', 'Creed Aventus Cologne', 'Creed Aventus For Her',
  ];
  
  // Normalize names for matching
  const normalizeName = (name: string) => name.toLowerCase().replace(/\s+/g, ' ').trim();
  const bestsellerSet = new Set(bestsellerNames.map(normalizeName));
  
  // Also include keyword-based matching for popular classics
  const bestsellerKeywords = [
    'acqua di gio', 'cool water', 'davidoff cool water',
    'bleu de chanel',
    'sauvage', 'dior sauvage',
    'creed aventus', 'aventus',
  ];
  
  const bestsellerKeywordSet = new Set(bestsellerKeywords.map(k => k.toLowerCase().trim()));
  
  let updates = 0;
  let alreadyBestseller = 0;
  const updatesList = [];
  
  for (const product of products) {
    const name = product.name.toLowerCase().trim();
    const isBestseller = product.isBestseller === 1;
    
    // Check if it matches bestseller criteria
    let shouldBeBestseller = false;
    
    // Check exact name match
    if (bestsellerSet.has(normalizeName(product.name))) {
      shouldBeBestseller = true;
    }
    // Check keyword match
    else {
      for (const keyword of bestsellerKeywordSet) {
        if (name.includes(keyword)) {
          shouldBeBestseller = true;
          break;
        }
      }
    }
    
    if (shouldBeBestseller && !isBestseller) {
      updatesList.push({ id: product.id, name: product.name });
      updates++;
    } else if (isBestseller) {
      alreadyBestseller++;
    }
  }
  
  console.log(`\nProducts to update: ${updates}`);
  console.log(`Already bestseller: ${alreadyBestseller}`);
  
  // Show sample
  console.log('\nSample updates:');
  updatesList.slice(0, 30).forEach(u => console.log(`  ${u.name}`));
  
  // Execute updates
  if (updates > 0) {
    console.log('\nExecuting updates...');
    for (const update of updatesList) {
      await client.execute({
        sql: 'UPDATE Product SET isBestseller = 1 WHERE id = ?',
        args: [update.id]
      });
    }
    console.log('Bestseller updates complete!');
  }
  
  // Verify
  const verify = await client.execute('SELECT COUNT(*) as count FROM Product WHERE isBestseller = 1 AND isActive = 1');
  console.log(`\nTotal bestseller products: ${verify.rows[0].count}`);
  
  // Show bestseller products
  const bestsellerProducts = await client.execute('SELECT name, gender FROM Product WHERE isBestseller = 1 AND isActive = 1');
  console.log('\nBestseller products:');
  bestsellerProducts.rows.forEach(r => console.log(`  ${r.name} (${r.gender})`));
}

main().catch(console.error);