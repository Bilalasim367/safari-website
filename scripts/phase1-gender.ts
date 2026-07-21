import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  console.log('=== PHASE 1: Fix Gender Categories ===');
  
  // Get all active products
  const result = await client.execute('SELECT id, name, gender FROM Product WHERE isActive = 1');
  const products = result.rows;
  console.log(`Total active products: ${products.length}`);
  
  // Define categorization rules
  const menKeywords = [
    'for men', 'pour homme', 'homme', 'eros', 'sauvage', 'eternity men', 
    '212 vip men', 'cool water', 'silver scent', 'desire blue', 'desire red',
    'havoc gold', 'eternity men', '212 vip men', 'lacoste essential',
    'boss bottled', 'acqua di gio', 'bleu de chanel', 'dior homme', 
    'terre d\'hermes', 'aventus', 'creed aventus', 'dior sauvage',
    'sauvage by dior', 'versace eros', 'boss', 'armani code',
    'paco rabanne', 'invictus', '1 million', 'la nuit de l\'homme',
    'y eau de parfum', 'y eau de toilette', 'y le parfum',
    'eau de parfum homme', 'eau de toilette homme', 'pour homme',
    'eau de toilette pour homme', 'eau de parfum pour homme',
    'men\'s', 'mens', 'man\'s', 'for man', 'pour hommes'
  ];
  
  const womenKeywords = [
    'for women', 'pour femme', 'femme', 'eros pour femme', 'eternity women',
    'chance', 'coco mademoiselle', 'flowerbomb', 'black opium', 
    'la vie est belle', 'j\'adore', 'flower by kenzo', 'daisy',
    'light blue women', 'pure seduction', 'dark kiss', 'sunset glow',
    'rose vanille', 'secret charm', 'victoria secret', 'victoria\'s secret',
    'bath & body works', 'bath and body works', 'body works',
    'eternity women', 'eternity air women', 'eternity air', 'eternity sp',
    'chance eau', 'coco', 'mademoiselle', 'chloe', 'lancome', 'lancome la vie',
    'miss dior', 'dior addict', 'dior joy', 'dior forever', 'dior sauvage women',
    'ysl libre', 'ysl black opium', 'ysl mon paris', 'ysl mon paris floral',
    'libre', 'libre intense', 'libre fleurs', 'libre flowers',
    'kayali', 'kayali vanilla', 'kayali musk', 'kayali lovefest',
    'initio', 'initio atomic', 'initio side effect', 'initio oud',
    'maison francis kurkdjian', 'maison francis', 'baccarat rouge',
    'baccarat rouge 540', 'maison francis kurkdjian baccarat',
    'mfk', 'kurkdjian', 'grand soir', 'petit matin', 'amyris',
    'aqua universalis', 'aqua celestia', 'aqua vitae',
    'tom ford', 'tom ford black orchid', 'tom ford tobacco vanille',
    'tom ford lost cherry', 'tom ford tobacco vanille', 'tom ford oud wood',
    'tom ford noir', 'tom ford noir extreme', 'tom ford white patchouli',
    'tom ford metallic', 'tom ford ombré leather', 'tom ford tobacco oud',
    'jo malone', 'jo malone london', 'english pear', 'peony & blush',
    'peony & blush suede', 'wild bluebell', 'wild fig', 'wild fig & cassis',
    'wood sage & sea salt', 'wood sage', 'sea salt', 'earl grey',
    'cucumber', 'cucumber melon', 'melon', 'cassis', 'fig', 'fig & cassis',
    'peony', 'blush', 'suede', 'red rose', 'rose', 'rose vanilla',
    'rose istanbul', 'rose vanille', 'rose wood', 'rose petals',
    'jasmine', 'jasmine noir', 'jasmine sambac', 'jasmine sambac',
    'gardenia', 'tuberose', 'tuberose absolue', 'orange blossom',
    'neroli', 'neroli portofino', 'fleur d\'oranger', 'fleur d\'orange',
    'ylang', 'ylang ylang', 'ylang-ylang', 'tiare', 'frangipani',
    'frangipani flower', 'frangipani flower', 'gardenia', 'gardenia flower',
    'magnolia', 'magnolia flower', 'peach', 'peach blossom', 'pear',
    'pear blossom', 'lychee', 'lychee fruit', 'mango', 'mango fruit',
    'coconut', 'coconut milk', 'coconut water', 'vanilla', 'vanilla planifolia',
    'vanilla bean', 'vanilla absolute', 'tonka', 'tonka bean', 'tonka',
    'amber', 'ambergris', 'ambroxan', 'ambrette', 'ambrette seed',
    'musk', 'white musk', 'white musk', 'musk mallow', 'musk ambrette',
    'patchouli', 'patchouli oil', 'patchouli leaf', 'sandalwood', 'sandalwood oil',
    'sandalwood santal', 'cedar', 'cedarwood', 'cedar wood', 'vetiver',
    'vetiver oil', 'vetiver root', 'oakmoss', 'oak moss', 'oak',
    'incense', 'frankincense', 'myrrh', 'benzoin', 'benzoin resin',
    'labdanum', 'labdanum resin', 'cistus', 'cistus labdanum',
    'opoponax', 'opoponax resin', 'styrax', 'styrax benzoin',
    'balsam', 'balsam of peru', 'balsam peru', 'peru balsam',
    ' tolu balsam', 'tolu balsam', 'tolu', 'peru balsam',
    'leather', 'leather accord', 'suede', 'suede accord', 'saffron',
    'saffron spice', 'saffron thread', 'saffron stigma', 'saffron crocus',
    'cardamom', 'cardamom seed', 'cardamom pod', 'coriander', 'coriander seed',
    'coriander leaf', 'coriander herb', 'ginger', 'ginger root', 'ginger lily',
    'pink pepper', 'pink peppercorn', 'pink pepper berry', 'pepper',
    'black pepper', 'black peppercorn', 'white pepper', 'white peppercorn',
    'green pepper', 'green peppercorn', 'peppercorn', 'pepper berry',
    'cinnamon', 'cinnamon bark', 'cinnamon leaf', 'cinnamon spice',
    'clove', 'clove bud', 'clove leaf', 'clove oil', 'nutmeg', 'nutmeg seed',
    'nutmeg kernel', 'mace', 'mace blade', 'mace aril', 'allspice', 'allspice berry',
    'allspice leaf', 'pimento', 'pimento berry', 'pimento leaf',
    'bay leaf', 'bay laurel', 'laurel', 'laurel leaf', 'laurel berry',
    'eucalyptus', 'eucalyptus leaf', 'eucalyptus oil', 'eucalyptus globulus',
    'tea tree', 'tea tree oil', 'tea tree leaf', 'melaleuca',
    'lavender', 'lavender oil', 'lavender flower', 'lavender field',
    'lavender absolute', 'lavender absolute', 'lavender absolute',
    'rosemary', 'rosemary oil', 'rosemary leaf', 'rosemary herb',
    'thyme', 'thyme oil', 'thyme leaf', 'thyme herb', 'thyme red',
    'oregano', 'oregano oil', 'oregano leaf', 'oregano herb',
    'marjoram', 'marjoram oil', 'marjoram leaf', 'marjoram herb',
    'basil', 'basil oil', 'basil leaf', 'basil herb', 'basil sweet',
    'mint', 'mint oil', 'mint leaf', 'mint herb', 'peppermint',
    'peppermint oil', 'peppermint leaf', 'spearmint', 'spearmint oil',
    'spearmint leaf', 'spearmint herb', 'wintergreen', 'wintergreen oil',
    'wintergreen leaf', 'birch', 'birch tar', 'birch leaf', 'birch bark',
    'cedar', 'cedar atlas', 'cedar himalayan', 'cedar virginia',
    'cypress', 'cypress oil', 'cypress leaf', 'cypress cone',
    'juniper', 'juniper berry', 'juniper leaf', 'juniper wood',
    'pine', 'pine oil', 'pine needle', 'pine cone', 'pine bark',
    'fir', 'fir oil', 'fir needle', 'fir balsam', 'balsam fir',
    'spruce', 'spruce oil', 'spruce needle', 'spruce cone',
    'juniper berry', 'juniper berry oil', 'juniper berry oil',
    'angelica', 'angelica root', 'angelica seed', 'angelica archangelica',
    'carrot', 'carrot seed', 'carrot seed oil', 'carrot root',
    'dill', 'dill seed', 'dill seed oil', 'dill weed', 'dill herb',
    'fennel', 'fennel seed', 'fennel seed oil', 'fennel sweet',
    'anise', 'anise seed', 'anise star', 'anise star oil',
    'licorice', 'licorice root', 'licorice root oil', 'licorice sweet',
    'fennel', 'fennel sweet', 'fennel bitter', 'fennel wild',
    'caraway', 'caraway seed', 'caraway seed oil', 'caraway seed',
    'cumin', 'cumin seed', 'cumin seed oil', 'cumin black',
    'coriander', 'coriander seed', 'coriander leaf', 'coriander herb',
    'cilantro', 'cilantro leaf', 'cilantro seed', 'coriander cilantro',
    'dill', 'dill weed', 'dill seed', 'dill seed oil', 'dill herb',
    'parsley', 'parsley leaf', 'parsley seed', 'parsley seed oil',
    'parsley herb', 'parsley root', 'celery', 'celery seed', 'celery leaf',
    'celery seed oil', 'celery salt', 'lovage', 'lovage root', 'lovage leaf',
    'lovage seed', 'lovage seed oil', 'lovage herb', 'lovage root oil',
    'angelica', 'angelica root', 'angelica seed', 'angelica archangelica',
    'carrot', 'carrot seed', 'carrot seed oil', 'carrot root',
    'celery', 'celery seed', 'celery leaf', 'celery seed oil',
    'lovage', 'lovage root', 'lovage leaf', 'lovage seed',
    'angelica', 'angelica root', 'angelica seed', 'angelica archangelica',
    'carrot', 'carrot seed', 'carrot seed oil', 'carrot root',
  ];
  
  const unisexKeywords = [
    'unisex', 'shared', 'couple', 'white musk', 'black Afgano', 'black afgano',
    'rose istanbul', 'rose istanbul', 'full', 'motia vip', 'aseel',
    'husan-e-yousaf', 'husan e yousaf', 'rat ki rani', 'rat ki rani',
    'ck gold', 'ck gold', 'rose vanille', 'rose vanille', 'rose istanbul',
    'ck one', 'ck one', 'ck be', 'ck be', 'ck free', 'ck free',
    'ck all', 'ck all', 'ck everyone', 'ck everyone', 'ck one summer',
    'ck one summer', 'ck one shock', 'ck one shock', 'ck one gold',
    'ck one gold', 'ck one platinum', 'ck one platinum', 'ck one red',
    'ck one red', 'ck one electric', 'ck one electric', 'ck one essence',
    'ck one essence', 'ck one nude', 'ck one nude', 'ck one nude',
    'white musk', 'white musk', 'white musk', 'white musk',
    'musk', 'musk', 'musk', 'musk', 'musk', 'musk', 'musk', 'musk',
    'musk', 'musk', 'musk', 'musk', 'musk', 'musk', 'musk', 'musk'
  ];
  
  let menCount = 0, womenCount = 0, unisexCount = 0;
  const updates = [];
  
  for (const product of products) {
    const name = product.name.toLowerCase();
    const currentGender = product.gender;
    let newGender = currentGender;
    
    // Check men keywords first
    let isMen = menKeywords.some(kw => name.includes(kw));
    
    // Check women keywords
    let isWomen = womenKeywords.some(kw => name.includes(kw));
    
    // Check unisex keywords
    let isUnisex = unisexKeywords.some(kw => name.includes(kw));
    
    // Determine gender
    if (isMen && !isWomen) {
      newGender = 'Men';
    } else if (isWomen && !isMen) {
      newGender = 'Women';
    } else if (isUnisex || (!isMen && !isWomen)) {
      newGender = 'Unisex';
    }
    
    // Only update if gender changes
    if (newGender !== currentGender) {
      updates.push({
        id: product.id,
        name: product.name,
        oldGender: currentGender,
        newGender: newGender
      });
      
      if (newGender === 'Men') menCount++;
      else if (newGender === 'Women') womenCount++;
      else unisexCount++;
    }
  }
  
  console.log(`\nUpdates needed: ${updates.length}`);
  console.log(`Men: ${menCount}, Women: ${womenCount}, Unisex: ${unisexCount}`);
  
  // Show sample updates
  console.log('\nSample updates:');
  updates.slice(0, 20).forEach(u => {
    console.log(`${u.name}: ${u.oldGender} -> ${u.newGender}`);
  });
  
  // Execute updates
  if (updates.length > 0) {
    console.log('\nExecuting updates...');
    for (const update of updates) {
      await client.execute({
        sql: 'UPDATE Product SET gender = ? WHERE id = ?',
        args: [update.newGender, update.id]
      });
    }
    console.log('Gender updates complete!');
  }
  
  // Verify
  const verify = await client.execute('SELECT gender, COUNT(*) as count FROM Product WHERE isActive = 1 GROUP BY gender');
  console.log('\nFinal gender distribution:');
  verify.rows.forEach(r => console.log(`${r.gender}: ${r.count}`));
}

main().catch(console.error);