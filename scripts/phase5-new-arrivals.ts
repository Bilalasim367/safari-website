import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  console.log('=== PHASE 5: Update New Arrival Flags ===');
  
  // Get all active products
  const result = await client.execute('SELECT id, name, gender, isNew FROM Product WHERE isActive = 1');
  const products = result.rows;
  console.log(`Total active products: ${products.length}`);
  
  // New arrivals to KEEP (only the 4 Safari products)
  const keepNewArrivals = [
    'Safari Rose',
    'Safari Oud', 
    'Safari Vanilla',
    'Safari Bloom'
  ];
  
  const keepNewSet = new Set(keepNewArrivals.map(n => n.toLowerCase().trim()));
  
  let updates = 0;
  let alreadyNew = 0;
  let removedFromNew = 0;
  const updatesList = [];
  const removalsList = [];
  
  for (const product of products) {
    const name = product.name.toLowerCase().trim();
    const isNew = product.isNew === 1;
    const isKeepNew = keepNewSet.has(name);
    
    // Should only be new if it's in the keep list
    let shouldBeNew = isKeepNew;
    
    if (shouldBeNew && !isNew) {
      updatesList.push({ id: product.id, name: product.name });
      updates++;
    } else if (!shouldBeNew && isNew) {
      removalsList.push({ id: product.id, name: product.name });
      removedFromNew++;
    } else if (isNew) {
      alreadyNew++;
    }
  }
  
  console.log(`\nProducts to mark as new: ${updates}`);
  console.log(`Products to remove from new: ${removedFromNew}`);
  console.log(`Already correctly marked new: ${alreadyNew}`);
  
  // Show sample
  console.log('\nWill mark as new:');
  updatesList.forEach(u => console.log(`  ${u.name}`));
  
  console.log('\nWill remove from new:');
  removalsList.slice(0, 30).forEach(r => console.log(`  ${r.name}`));
  if (removalsList.length > 30) console.log(`  ... and ${removalsList.length - 30} more`);
  
  // Execute updates - mark new
  if (updates > 0) {
    console.log('\nMarking new arrivals...');
    for (const update of updatesList) {
      await client.execute({
        sql: 'UPDATE Product SET isNew = 1 WHERE id = ?',
        args: [update.id]
      });
    }
  }
  
  // Execute updates - remove from new
  if (removedFromNew > 0) {
    console.log('\nRemoving old products from new arrivals...');
    for (const removal of removalsList) {
      await client.execute({
        sql: 'UPDATE Product SET isNew = 0 WHERE id = ?',
        args: [removal.id]
      });
    }
  }
  
  console.log('\nNew arrival updates complete!');
  
  // Verify
  const verify = await client.execute('SELECT COUNT(*) as count FROM Product WHERE isNew = 1 AND isActive = 1');
  console.log(`\nTotal new arrival products: ${verify.rows[0].count}`);
  
  // Show new arrival products
  const newProducts = await client.execute('SELECT name, gender FROM Product WHERE isNew = 1 AND isActive = 1');
  console.log('\nNew arrival products:');
  newProducts.rows.forEach(r => console.log(`  ${r.name} (${r.gender})`));
}

main().catch(console.error);