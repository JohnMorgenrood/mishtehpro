import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// Admin email addresses
const ADMIN_EMAILS = ['mishteh144@gmail.com', 'rubyroyal1@gmail.com'];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Check if user is an admin
        const userType = ADMIN_EMAILS.includes(user.email) ? 'ADMIN' : user.userType;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          userType: userType,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        try {
          const email = user.email;
          if (!email) return false;

          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          // Create user if doesn't exist
          if (!dbUser) {
            // Check if email is admin
            const userType = ADMIN_EMAILS.includes(email) ? 'ADMIN' : 'DONOR';
            
            dbUser = await prisma.user.create({
              data: {
                email,
                password: null, // OAuth users don't have passwords
                fullName: user.name || 'Google User',
                userType: userType,
                image: user.image,
              },
            });
          }

          // Override userType if email is in admin list
          const finalUserType = ADMIN_EMAILS.includes(email) ? 'ADMIN' : dbUser.userType;

          // Store the database user ID in the account
          user.id = dbUser.id;
          (user as any).userType = finalUserType;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.userType = (user as any).userType;
        token.email = user.email;
      } else if (token.id) {
        // Check if email is admin
        if (token.email && ADMIN_EMAILS.includes(token.email as string)) {
          token.userType = 'ADMIN';
        } else {
          // Refresh user data from database to get latest userType
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { userType: true },
          });
          if (dbUser) {
            token.userType = dbUser.userType;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as any;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If user is being redirected after sign in, check the URL
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // For callback URLs, redirect based on user type
      if (url.includes('/api/auth/callback')) {
        // This will be handled by the calling page
        return baseUrl;
      }
      
      // Default redirect to base URL
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
