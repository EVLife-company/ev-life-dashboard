import { NextRequest } from 'next/server';
import { getSessionUser, apiResponse, apiError } from '@/lib/auth';
import { getBookings, createBooking } from '@/lib/firestore';

export async function GET(req: NextRequest) {
  let user = null;

  try {
    user = await getSessionUser();
  } catch (e) {
    console.log("Auth error:", e);
  }

  // ✅ TEMP: allow access even if not logged in (DEV MODE)
  // if (!user) return apiError('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();

  try {
    const centreFilter =
      user?.role === 'servicecentre' ? user.centreName : undefined;

    console.log("centreFilter:", centreFilter);

    let bookings = (await getBookings(centreFilter)) as any[];

    console.log("bookings from firestore:", bookings);

    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }

    if (search) {
      bookings = bookings.filter(b =>
        b.userName?.toLowerCase().includes(search) ||
        b.service?.toLowerCase().includes(search) ||
        b.centre?.toLowerCase().includes(search) ||
        b.userEmail?.toLowerCase().includes(search)
      );
    }

    return apiResponse(bookings);
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    return apiError('Failed to fetch bookings', 500);
  }
}

export async function POST(req: NextRequest) {
  let user = null;

  try {
    user = await getSessionUser();
  } catch (e) {
    console.log("Auth error:", e);
  }

  // ✅ TEMP: allow create without login
  // if (!user) return apiError('Unauthorized', 401);

  try {
    const body = await req.json();

    const { userName, userEmail, service, centre, date, time, amount } = body;

    if (!userName || !service || !centre || !date || !time) {
      return apiError('Missing required fields');
    }

    const id = await createBooking({
      userName,
      userEmail: userEmail || '',
      userId: `manual_${Date.now()}`,
      vehicleMake: body.vehicleMake || '—',
      vehicleModel: body.vehicleModel || '—',
      service,
      centre,
      date,
      time,
      amount: Number(amount) || 0,
      status: 'pending',
    });

    return apiResponse({ id, success: true }, 201);
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    return apiError('Failed to create booking', 500);
  }
}