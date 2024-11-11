import 'server-only';
import { base64url, EncryptJWT, exportJWK, generateSecret, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';
import type { InviteTokenClaims, SessionTokenClaims } from './types';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

const savedSecret = process.env.JWT_SECRET;
if (!savedSecret) throw new Error('No JWT secret.');
export const secret = base64url.decode(savedSecret);

export const issuer = 'oscar:party';
export const audience = 'player';

export const getSession = async () => {
  try {
    const token = (await cookies()).get('auth');
    const { payload } = token ? (
      await jwtDecrypt<SessionTokenClaims>(
        token.value,
        secret,
        {
          issuer,
          audience,
          requiredClaims: ['plr'],
        }
      )
    ) : {};
    return payload ? payload.plr : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const startSession = async (id: string, cookieStore: ReadonlyRequestCookies) => {
  const payload: SessionTokenClaims = {
    plr: id,
  };

  const sessionToken = await new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime('30 days')
    .encrypt(secret);
    
  cookieStore.set('auth', sessionToken);
};

export const endSession = async (cookieStore: ReadonlyRequestCookies) => {
  cookieStore.delete('auth');
};

export const createInviteToken = async () => {
  const secretKey = await generateSecret('HS256', { extractable: true });
  const jwk = await exportJWK(secretKey);
  const code = jwk.k!;

  const payload: InviteTokenClaims = {
    cod: code,
  };

  const token = await new EncryptJWT(payload)
  .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
  .setIssuedAt()
  .setIssuer(issuer)
  .setAudience(audience)
  .setExpirationTime('1 day')
  .encrypt(secret);

  return [token, code];
};

export const extractInviteCode = async (token: string) => {
  try {
    const { payload } = token ? (
      await jwtDecrypt<SessionTokenClaims>(
        token,
        secret,
        {
          issuer,
          audience,
          requiredClaims: ['cod'],
        }
      )
    ) : {};
    return payload ? payload.cod : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
