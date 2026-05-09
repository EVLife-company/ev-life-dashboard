import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { getSessionUser, apiResponse, apiError } from '@/lib/auth';

// ✅ GET Centres
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    const snapshot = await adminDb.collection('service_centres').get();

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


// ✅ POST Create Centre + Auth + User
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return apiError('Forbidden', 403);
    }

    const body = await req.json();
    const { name, location, adminEmail, password, contact, hours } = body;

    if (!name || !adminEmail || !password) {
      return apiError('Missing required fields');
    }

    // 1️⃣ Check if email already exists
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(adminEmail);
      return apiError('Email already in use');
    } catch {
      // safe to create
    }

    // 2️⃣ Create Auth user
    userRecord = await adminAuth.createUser({
      email: adminEmail,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // 3️⃣ Set role in Auth
    await adminAuth.setCustomUserClaims(uid, {
      role: 'service_centre',
    });

    // 4️⃣ Create Centre (auto ID)
    const centreRef = adminDb.collection('service_centres').doc();
    const centreId = centreRef.id;

    const centreData = {
      name,
      location,
      contact: contact || '',
      hours: hours || '',
      adminEmail,
      adminUid: uid,
      status: 'active',
      createdAt: new Date(),
    };

    await centreRef.set(centreData);

    // 5️⃣ Create Users collection (🔥 THIS WAS MISSING)
    await adminDb.collection('users').doc(uid).set({
      email: adminEmail,
      name,
      role: 'service_centre',
      serviceCentreId: centreId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return apiResponse({
      success: true,
      centreId,
      uid,
    }, 201);

  } catch (error: any) {
    console.error("POST ERROR:", error);
    return apiError(error.message, 500);
  }
}