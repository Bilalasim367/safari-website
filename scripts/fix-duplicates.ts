import prisma from '@/lib/prisma'

const duplicatePairs = [
  { delete: 'tobacco-oud-by-tom-ford-2', keep: 'tobacco-oud-by-tom-ford' },
  { delete: 'office-for-men-by-jeremy-fragrance-2', keep: 'office-for-men-by-jeremy-fragrance' },
  { delete: 'chanel-no-5-red-by-chanel-2', keep: 'chanel-no-5-red-by-chanel' },
  { delete: 'k-by-dolce-gabbana-dg-2', keep: 'k-by-dolce-gabbana-dg' },
  { delete: '212-sexy-men-by-carolina-herrera-2', keep: '212-sexy-men-by-carolina-herrera' },
  { delete: 'herrera-for-men-by-carolina-herrera-2', keep: 'herrera-for-men-by-carolina-herrera' },
  { delete: 'hugo-energise-men-by-hugo-boss-2', keep: 'hugo-energise-men-by-hugo-boss' },
  { delete: 'legend-by-montblanc-2', keep: 'legend-by-montblanc' },
  { delete: 'jaguar-classic-gold-by-jaguar-2', keep: 'jaguar-classic-gold-by-jaguar' },
  { delete: 'light-blue-by-dolce-gabbana-dg-2', keep: 'light-blue-by-dolce-gabbana-dg' },
]

async function main() {
  console.log('=== Soft-deleting -2 variants ===')
  for (const pair of duplicatePairs) {
    const result = await prisma.product.update({
      where: { slug: pair.delete },
      data: { isActive: false },
    })
    console.log(`Soft-deleted: ${pair.delete} → now isActive=false`)
  }

  console.log('\n=== Redirects for next.config.js ===')
  const redirects = duplicatePairs.map(p => 
    `  { source: '/shop/${p.delete}', destination: '/shop/${p.keep}', permanent: true },`
  ).join('\n')
  console.log(redirects)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => process.exit(0))