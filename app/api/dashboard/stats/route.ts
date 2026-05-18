import { getSessionUser, apiResponse, apiError } from '@/lib/auth';
import { getDashboardStats } from '@/lib/firestore';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    // Filter if service centre login
    const centreFilter =
      user.role === 'service_centre' ? user.centreName : undefined;

    const stats = await getDashboardStats(centreFilter);

    // 👇 IMPORTANT: make sure stats includes new fields
    return apiResponse({
      ...stats,
      services: stats.services || [],
      centres: stats.centres || [],
      infraActions: stats.infraActions || [],
    });

  } catch (err) {
    console.error('Dashboard API error:', err);
    return apiError('Failed to load dashboard', 500);
  }
}