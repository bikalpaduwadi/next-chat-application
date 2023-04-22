import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter';

import { db } from './db';
import { fetchRedis } from '@/helper/redis';

const getGoogleCredentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Goolgel client_id or client_secret');
  }

  return {
    clientId,
    clientSecret,
  };
};

export const authOptions: AuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const dbUserResopnse = (await fetchRedis('get', `user:${token.id}`)) as
        | string
        | null;

      if (!dbUserResopnse) {
        token.id = user!.id;
        return token;
      }

      const dbUser = JSON.parse(dbUserResopnse) as User;

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },

    redirect() {
      return '/dashboard';
    },
  },
};
