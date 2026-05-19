import { NextRequest } from 'next/server';
import { getSessionUser, apiResponse, apiError } from '@/lib/auth';
import { getBookings, createBooking } from '@/lib/firestore';

export async function GET(req: NextRequest) {
  let user: any = null;

  try {
    user = await getSessionUser();
  } catch (e) {
    console.log("Auth error:", e);
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();

  try {
    // 🔥 DIBAIKI: Tukar user.centreName kepada user.serviceCentreId 
    // supaya sepadan dengan fungsi getBookings(centreIdFilter) di firestore.ts
    const centreIdFilter = user?.role === 'service_centre' ? user.serviceCentreId : undefined;

    console.log("centreIdFilter applied:", centreIdFilter);

    // Fetch dari Firestore menggunakan ID pusat
    let rawBookings = (await getBookings(centreIdFilter)) as any[];

    console.log("Raw bookings from Firestore count:", rawBookings.length);

    // 1. Filter mengikut Status
    if (status) {
      rawBookings = rawBookings.filter(b => b.status === status);
    }

    // 2. Filter mengikut Kata Kunci Carian (Menggunakan key camelCase yang dipulangkan oleh getBookings)
    if (search) {
      rawBookings = rawBookings.filter(b =>
        b.userName?.toLowerCase().includes(search) ||
        b.userEmail?.toLowerCase().includes(search) ||
        b.serviceTypeName?.toLowerCase().includes(search) || 
        b.bookingRef?.toLowerCase().includes(search) ||      
        b.vehiclePlate?.toLowerCase().includes(search)       
      );
    }

    // 3. Return struktur data ke frontend
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

    // Mapping incoming body mengikut konvensyen nama Firestore anda
    const { 
      userName, 
      userEmail, 
      serviceTypeId,    // Ditambah untuk kesempurnaan data relational
      serviceTypeName, 
      serviceCentreId,  // Ditambah supaya data booking baru ada ID pusat
      serviceCentreName, 
      bookingDate, 
      bookingTime, 
      amount 
    } = body;

    // Validasi data wajib
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
      serviceTypeId: serviceTypeId || '',
      serviceTypeName,
      serviceCentreId: serviceCentreId || '', // Memastikan ID disimpan sewaktu booking baharu dibuat
      serviceCentreName,
      bookingDate,
      bookingTime,
      amount: Number(amount) || 0,
      status: 'pending'
    });

    return apiResponse({ id, success: true }, 201);
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    return apiError('Failed to create booking', 500);
  }
}