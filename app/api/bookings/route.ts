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

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();

  try {
    // If the user is a service centre, filter by their centre name
    // Ensure user.centreName matches the field 'serviceCentreName' in Firestore
    const centreFilter = user?.role === 'servicecentre' ? user.centreName : undefined;

    console.log("centreFilter applied:", centreFilter);

    // Fetch from Firestore
    let rawBookings = (await getBookings(centreFilter)) as any[];

    console.log("Raw bookings from Firestore count:", rawBookings.length);

    // 1. Filter by Status
    if (status) {
      rawBookings = rawBookings.filter(b => b.status === status);
    }

    // 2. Filter by Search (Matching your actual Firestore keys)
    if (search) {
      rawBookings = rawBookings.filter(b =>
        b.userName?.toLowerCase().includes(search) ||
        b.userEmail?.toLowerCase().includes(search) ||
        b.serviceTypeName?.toLowerCase().includes(search) || // Corrected key
        b.bookingRef?.toLowerCase().includes(search) ||      // Added Ref search
        b.vehiclePlate?.toLowerCase().includes(search)       // Added Plate search
      );
    }

    // 3. IMPORTANT: Return the structure the frontend expects
    // We wrap it in an object { bookings: [...] } to avoid .map() errors
    return apiResponse({
      success: true,
      bookings: rawBookings
    });

  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    return apiError('Failed to fetch bookings', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mapping incoming body to your Firestore naming convention
    const { 
      userName, 
      userEmail, 
      serviceTypeName, 
      serviceCentreName, 
      bookingDate, 
      bookingTime, 
      amount 
    } = body;

    // Validation
    if (!userName || !serviceTypeName || !serviceCentreName || !bookingDate || !bookingTime) {
      return apiError('Missing required fields: name, service, centre, date, or time');
    }

    const id = await createBooking({
      userName,
      userEmail: userEmail || '',
      userId: body.userId || `manual_${Date.now()}`,
      vehicleMake: body.vehicleMake || '—',
      vehicleModel: body.vehicleModel || '—',
      vehiclePlate: body.vehiclePlate || '—',
      serviceTypeName,
      serviceCentreName,
      bookingDate,
      bookingTime,
      amount: Number(amount) || 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return apiResponse({ id, success: true }, 201);
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    return apiError('Failed to create booking', 500);
  }
}