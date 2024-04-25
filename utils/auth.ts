/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Lucia } from 'lucia';
import { prisma as client } from '~/utils/db';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { env } from '~/env.mjs';
import { cache } from 'react';
import { createRouteWithSearchParams } from './calculateRedirectedRoutes';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const adapter = new PrismaAdapter(client.session, client.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'fresco-session',
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: env.NODE_ENV === 'production',
    },
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    // DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

// interface DatabaseSessionAttributes {}
interface DatabaseUserAttributes {
  username: string;
  hashedPassword: string;
}

export const getServerSession = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;
  const { user, session } = await lucia.validateSession(sessionId);
  try {
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {
    // Next.js throws error when attempting to set cookies when rendering page
  }
  return user;
});

export type RequireAuthOptions = {
  redirectPath?: string;
};

export async function requirePageAuth(
  { redirectPath = null } = {} as RequireAuthOptions,
) {
  const session = await getServerSession();

  if (!session) {
    if (!redirectPath) {
      redirect('/signin');
    }

    const redirectRoute = createRouteWithSearchParams(
      '/signin',
      'callbackUrl=' + encodeURI(redirectPath),
    );

    redirect(redirectRoute);
  }
  return session;
}

export async function requireApiAuth() {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
