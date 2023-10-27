import { UserSessionData } from '@/types.js';
import { getSessionStorage } from '@/utils/sessionStorage.js';

export async function fetchWithToken<T = void>(
  URL: string,
  params?: Record<string, string>,
  body?: NonNullable<unknown>
): Promise<T | undefined> {
  const userData = getSessionStorage<UserSessionData>('user');
  const searchParams = new URLSearchParams(params);

  try {
    if (userData?.token) {
      const data = await fetch(
        body
          ? import.meta.env.VITE_BACKEND_API_URL + URL
          : 'http://192.168.0.38:3000' + URL + '?' + searchParams.toString(),
        {
          method: body ? 'POST' : 'GET',
          headers: {
            'x-access-token': userData.token,
            ...(body && { 'Content-Type': 'application/json' })
          },
          body: body && JSON.stringify(body)
        }
      ).then((res) => res.json());

      return data;
    }
  } catch (err) {
    console.log(err);
  }
}
