import { NextRequest } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { adminDb } from '@/lib/firebase-admin'; // Use Admin SDK to read Firestore on server
import { signToken, apiResponse, apiError, UserRole } from '@/lib/auth';

const ADMIN_EMAILS = ['admin@evlife.my'];

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return apiError('Email and password required');

  try {
    // 1. Authenticate with Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 2. Setup default roles
    let role: UserRole = 'servicecentre';
    let centreName: string | undefined;
    let centreId: string | undefined;

    // 3. Admin Check
    if (ADMIN_EMAILS.includes(email)) {
      role = 'admin';
    } else {
      // 4. Fetch the Service Centre details from your 'users' collection
      // We use the UID as the document ID
      const userDoc = await adminDb.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return apiError('User profile not found in database', 404);
      }

      const userData = userDoc.data();
      
      // Ensure the user actually has a service centre role
      if (userData?.role !== 'service_centre') {
        return apiError('Unauthorized access role', 403);
      }

      role = 'servicecentre';
      centreId = userData.serviceCentreId; // e.g., "sc08"
      centreName = userData.name;         // e.g., "EVLife Service Centre — KL Sentral"
    }

    // 5. Create the token with the specific centreId
    const token = await signToken({ uid, email, role, centreName, centreId });

    // 6. Return response and set the Cookie
    const res = apiResponse({ success: true, role, centreName, centreId });
    res.headers.set('Set-Cookie',
      `evlife_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax; Secure`
    );
    
    return res;

  } catch (e: any) {
    console.error('Login Error:', e);
    const msg = e.code === 'auth/invalid-credential' ? 'Wrong email or password' : 'Login failed';
    return apiError(msg, 401);
  }
}