import { z } from 'zod'

/**
 * Validation schemas using Zod
 */

// Algerian phone number: 0[5-7][0-9]{8}
export const phoneSchema = z.string().regex(
  /^0[567]\d{8}$/,
  'Format de téléphone invalide (ex: 0555123456)'
)

// Order checkout schema
export const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Nom complet requis (min 3 caractères)').max(100),
  phone: phoneSchema,
  wilaya: z.string().min(1, 'Wilaya requise'),
  commune: z.string().min(2, 'Commune requise').max(100),
  address: z.string().min(10, 'Adresse requise (min 10 caractères)').max(500),
  notes: z.string().max(300).optional(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().min(1).max(10),
    })
  ).min(1, 'Panier vide'),
})

// Product creation/update schema
export const productSchema = z.object({
  nameFr: z.string().min(1, 'Nom français requis').max(200),
  nameAr: z.string().min(1, 'Nom arabe requis').max(200),
  descriptionFr: z.string().min(1, 'Description française requise'),
  descriptionAr: z.string().min(1, 'Description arabe requise'),
  brandId: z.string(),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX']),
  categoryIds: z.array(z.string()).min(1, 'Au moins une catégorie requise'),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isActive: z.boolean(),
  images: z.array(
    z.object({
      url: z.string().url(),
      altFr: z.string().optional(),
      altAr: z.string().optional(),
      order: z.number().int(),
    })
  ).optional().default([]),
  variants: z.array(
    z.object({
      size: z.string().min(1),
      price: z.number().positive('Prix doit être positif'),
      stock: z.number().int().min(0),
    })
  ).min(1, 'Au moins un variant requis'),
})

// Promotion schema
export const promotionSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  discountValue: z.number().positive('Valeur de réduction doit être positive'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Date de début invalide',
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Date de fin invalide',
  }),
  isActive: z.boolean(),
  variantIds: z.array(z.string()).min(1, 'Au moins un variant requis'),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'Date de fin doit être après date de début',
  path: ['endDate'],
}).refine(data => {
  if (data.discountType === 'percentage') {
    return data.discountValue <= 100
  }
  return true
}, {
  message: 'Le pourcentage ne peut pas dépasser 100%',
  path: ['discountValue'],
})

// Settings schema
export const settingsSchema = z.object({
  storeNameFr: z.string().min(1).max(100),
  storeNameAr: z.string().min(1).max(100),
  phone: z.string(),
  email: z.string().email().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  bannerTextFr: z.string().max(200),
  bannerTextAr: z.string().max(200),
  bannerEnabled: z.boolean(),
})

// Brand/Category schema
export const brandCategorySchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
})

// Order status update schema
export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

// Variant update schema
export const variantUpdateSchema = z.object({
  stock: z.number().int().min(0).optional(),
  price: z.number().positive().optional(),
}).refine(data => data.stock !== undefined || data.price !== undefined, {
  message: 'Au moins un champ (stock ou price) doit être fourni',
})
