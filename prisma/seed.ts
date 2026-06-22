import { PrismaClient, Locale } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcryptjs'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // -------------------------------------------------------------------------
  // Admin user
  // -------------------------------------------------------------------------
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@parfums.dz'

  const passwordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // -------------------------------------------------------------------------
  // Settings singleton
  // -------------------------------------------------------------------------
  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      storeNameFr: 'Parfums de Luxe',
      storeNameAr: 'عطور فاخرة',
      phone: '+213 555 123 456',
      email: 'contact@parfums.dz',
      instagramUrl: 'https://instagram.com/parfums',
      bannerTextFr: 'Livraison gratuite pour toute commande supérieure à 5000 DA',
      bannerTextAr: 'توصيل مجاني لجميع الطلبات فوق 5000 دج',
      bannerEnabled: true,
    },
  })

  console.log('✅ Settings created')

  // -------------------------------------------------------------------------
  // Brands with Arabic translations
  // -------------------------------------------------------------------------
  const brands = [
    { name: 'Chanel', slug: 'chanel', arName: 'شانيل' },
    { name: 'Dior', slug: 'dior', arName: 'ديور' },
    { name: 'Tom Ford', slug: 'tom-ford', arName: 'توم فورد' },
  ]

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug },
    })
  }

  console.log('✅ Brands created:', brands.length)

  // -------------------------------------------------------------------------
  // Categories with Arabic translations
  // -------------------------------------------------------------------------
  const categories = [
    { name: 'Eau de Parfum', slug: 'eau-de-parfum', arName: 'ماء عطر' },
    { name: 'Eau de Toilette', slug: 'eau-de-toilette', arName: 'ماء تواليت' },
    { name: 'Parfum', slug: 'parfum', arName: 'عطر' },
  ]

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug },
    })
  }

  console.log('✅ Categories created:', categories.length)

  console.log('🎉 Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
