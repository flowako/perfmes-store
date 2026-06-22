/**
 * Script to fix product slugs
 * This script regenerates proper URL-friendly slugs for all products
 * based on their French names.
 * 
 * Run with: npx tsx scripts/fix-product-slugs.ts
 */

import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient()

async function fixProductSlugs() {
  console.log('🔧 Starting product slug fix...\n')

  try {
    // Get all products with their French translations
    const products = await prisma.product.findMany({
      include: {
        translations: {
          where: { locale: 'fr' }
        }
      }
    })

    console.log(`Found ${products.length} products to process\n`)

    let fixed = 0
    let skipped = 0

    for (const product of products) {
      const frTranslation = product.translations.find(t => t.locale === 'fr')
      
      if (!frTranslation) {
        console.log(`⚠️  Skipping product ${product.id} - no French translation`)
        skipped++
        continue
      }

      // Generate proper slug
      let newSlug = slugify(frTranslation.name, { lower: true, strict: true })
      
      // If slug hasn't changed, skip
      if (newSlug === product.slug) {
        console.log(`✓ Product "${frTranslation.name}" already has correct slug: ${product.slug}`)
        skipped++
        continue
      }

      // Check for conflicts and make unique if needed
      let finalSlug = newSlug
      let counter = 1
      let slugExists = await prisma.product.findFirst({
        where: {
          slug: finalSlug,
          NOT: { id: product.id }
        }
      })

      while (slugExists) {
        finalSlug = `${newSlug}-${counter}`
        slugExists = await prisma.product.findFirst({
          where: {
            slug: finalSlug,
            NOT: { id: product.id }
          }
        })
        counter++
      }

      // Update the product
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: finalSlug }
      })

      console.log(`✓ Updated "${frTranslation.name}": "${product.slug}" → "${finalSlug}"`)
      fixed++
    }

    console.log(`\n✅ Slug fix completed!`)
    console.log(`   - Fixed: ${fixed}`)
    console.log(`   - Skipped: ${skipped}`)
    console.log(`   - Total: ${products.length}`)
  } catch (error) {
    console.error('❌ Error fixing slugs:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixProductSlugs()
  .then(() => {
    console.log('\n🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
