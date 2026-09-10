import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor ingrese usuario y contraseña');
        }

        await dbConnect();
        const inputVal = credentials.email.trim().toLowerCase();
        const enteredPassword = credentials.password;

        // RESTRICCIÓN TOTAL: Únicamente 'control.admin' está autorizado.
        // Cualquier otro usuario (incluyendo 'administrador', 'admin', etc.) queda estrictamente bloqueado.
        if (inputVal !== 'control.admin') {
          throw new Error('Usuario o contraseña incorrectos');
        }

        const user = await User.findOne({
          email: 'control.admin'
        });

        if (!user || !user.password) {
          throw new Error('Usuario o contraseña incorrectos');
        }

        const isPasswordValid = await bcrypt.compare(enteredPassword, user.password);
        if (!isPasswordValid) {
          throw new Error('Usuario o contraseña incorrectos');
        }

        return {
          id: String(user._id),
          name: user.name || 'Administrador',
          email: user.email,
          role: user.role || 'admin',
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'supersecretnextauthkey12345'
};
