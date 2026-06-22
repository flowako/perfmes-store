import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import * as bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

/**
 * NextAuth v5 configuration
 * Uses credentials provider for admin login
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Auth attempt:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          // Add 1-second delay to prevent brute force attacks
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Fetch admin user by email
          const admin = await prisma.adminUser.findUnique({
            where: { email: credentials.email as string }
          })

          console.log('Admin found:', admin ? 'yes' : 'no')

          // Verify password
          if (!admin) {
            console.log('Admin not found')
            return null
          }
          
          const isValid = await bcrypt.compare(credentials.password as string, admin.passwordHash)
          console.log('Password valid:', isValid)
          
          if (!isValid) {
            console.log('Invalid password')
            return null
          }

          // Return user object
          console.log('Login successful for:', admin.email)
          return {
            id: admin.id,
            email: admin.email,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
})
