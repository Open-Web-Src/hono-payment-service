import { Lucia, TimeSpan } from 'lucia';
import type { Bindings } from 'hono';
import { D1Adapter } from '@lucia-auth/adapter-sqlite';

export const SESSION_NAME = 'session';
export const SESSION_EXPIRES_IN_DAYS = 30;
export const SESSION_EXPIRES_IN_SECONDS =
  60 * 60 * 24 * SESSION_EXPIRES_IN_DAYS;

export function initializeLuciaUser(env: Bindings) {
  const adapter = new D1Adapter(env.DB, {
    user: 'users',
    session: 'user_sessions',
  });

  return new Lucia(adapter, {
    getSessionAttributes: (_attributes) => {
      return {};
    },
    getUserAttributes: (user) => {
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    },
    sessionExpiresIn: new TimeSpan(SESSION_EXPIRES_IN_DAYS, 'd'),
    sessionCookie: {
      name: SESSION_NAME,
      expires: true,
      attributes: {
        secure: env.ENVIRONMENT !== 'local',
        sameSite: 'strict',
      },
    },
  });
}
