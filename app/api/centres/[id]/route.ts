import { NextRequest } from 'next/server';
import { getSessionUser, apiResponse, apiError } from '@/lib/auth';
import { updateCentre, deleteCentre } from '@/lib/firestore';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    const id = params.id;
    if (!id) return apiError('Missing centre ID', 400);

    const body = await req.json();

    // ❗ Remove undefined values (VERY IMPORTANT for Firestore)
    Object.keys(body).forEach(key => {
      if (body[key] === undefined) {
        delete body[key];
      }
    });

    await adminDb.collection('service_centres').doc(id).update({
      ...body,
      updatedAt: new Date(),
    });

    return apiResponse({ success: true });
  } catch (error: any) {
    console.error('PATCH ERROR:', error);
    return apiError(error.message || 'Server error', 500);
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    // 🔥 FILTER BY LOGGED-IN USER
    const snapshot = await adminDb
      .collection('service_centres')
      .where('adminUid', '==', user.uid)
      .get();

    if (snapshot.empty) {
      return apiResponse([]);
    }

    const centres = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return apiResponse(centres);

  } catch (error: any) {
    console.error("GET ERROR:", error);
    return apiError(error.message, 500);
  }
}

