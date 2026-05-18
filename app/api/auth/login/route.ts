import { NextRequest } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { adminDb } from '@/lib/firebase-admin';
import { signToken, apiResponse, apiError, UserRole } from '@/lib/auth';

const ADMIN_EMAILS = ['admin@evlife.my'];

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return apiError('Email and password required');
  }

  try {
    // 1. Firebase authentication
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 2. Default role
    let role: UserRole = 'service_centre';
    let centreName: string | undefined;
    let centreId: string | undefined;

    // 3. Admin check
    if (ADMIN_EMAILS.includes(email)) {
      role = 'admin';
    } else {
      // 4. Get service centre profile
      const userDoc = await adminDb.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return apiError('User profile not found in database', 404);
      }

      const userData = userDoc.data();

      if (userData?.role !== 'service_centre') {
        return apiError('Unauthorized access role', 403);
      }

      role = 'service_centre';
      centreId = userData.serviceCentreId;
      centreName = userData.name;
    }

    // 5. Create JWT token
    const token = await signToken({
      id: uid,
      uid,
      email,
      role,
      centreName,
      centreId,
    });

    // 6. Set cookie safely (Render + localhost compatible)
    const isProd = process.env.NODE_ENV === 'production';

    const cookie = [
      `evlife_token=${token}`,
      'HttpOnly',
      'Path=/',
      'Max-Age=86400',
      'SameSite=Lax',
      isProd ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    const res = apiResponse({
      success: true,
      role,
      centreName,
      centreId,
    });

    res.headers.set('Set-Cookie', cookie);

    return res;

  } catch (e: any) {
    console.error('Login Error:', e);

    const msg =
      e?.code === 'auth/invalid-credential'
        ? 'Wrong email or password'
        : 'Login failed';

    return apiError(msg, 401);
  }
}