import { NextRequest } from 'next/server';
import { getSessionUser, apiResponse, apiError } from '@/lib/auth';
import { getBookingById, updateBooking, deleteBooking } from '@/lib/firestore';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 401);

  const booking = await getBookingById(params.id);
  if (!booking) return apiError('Booking not found', 404);

  // This usually returns { data: booking }
  return apiResponse(booking);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 401);

  try {
    const body = await req.json();
    await updateBooking(params.id, body);
    return apiResponse({ success: true });
  } catch (e) {
    return apiError('Update failed', 400);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  // Ensure your session user object has a role field
  if (!user || user.role !== 'admin') return apiError('Forbidden', 403);

  await deleteBooking(params.id);
  return apiResponse({ success: true });
}