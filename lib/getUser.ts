export async function getUser() {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) return null;

  return await res.json();
}