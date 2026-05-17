import { NextRequest } from 'next/server';
import { getSessionUser, apiResponse, apiError } from '@/lib/auth';
import { updateStation, deleteStation } from '@/lib/firestore';

// Gunakan 'any' atau interface AuthUser yang kita bincangkan tadi
export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Support Next.js 15 async params
) {
  try {
    const user = await getSessionUser() as any;
    if (!user || user.role !== 'admin') return apiError('Forbidden', 403);

    const { id } = await params; // Await params di sini
    const body = await req.json();

    // Pastikan ID wujud sebelum update
    if (!id) return apiError('Station ID is required', 400);

    await updateStation(id, body);
    return apiResponse({ success: true, message: 'Station updated' });
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return apiError('Failed to update station', 500);
  }
}

export async function DELETE(
  _: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Support Next.js 15 async params
) {
  try {
    const user = await getSessionUser() as any;
    if (!user || user.role !== 'admin') return apiError('Forbidden', 403);

    const { id } = await params; // Await params di sini

    if (!id) return apiError('Station ID is required', 400);

    await deleteStation(id);
    return apiResponse({ success: true, message: 'Station deleted' });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return apiError('Failed to delete station', 500);
  }
}