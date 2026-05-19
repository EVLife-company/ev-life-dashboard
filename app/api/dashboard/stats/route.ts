import { getSessionUser, apiResponse, apiError } from '@/lib/auth';
import { getDashboardStats } from '@/lib/firestore';

export async function GET() {
  try {
    const user = await getSessionUser() as any;
    if (!user) return apiError('Unauthorized', 401);

    const centreIdFilter = user.role === 'service_centre' ? user.serviceCentreId : undefined;

    const stats = await getDashboardStats(centreIdFilter);

    return apiResponse({  
      pendingBookings: stats.pendingBookings || 0,
      confirmedBookings: stats.confirmedBookings || 0,
      completedBookings: stats.completedBookings || 0,
      cancelledBookings: stats.cancelledBookings || 0,
      totalRevenue: stats.totalRevenue || 0,
      recentBookings: stats.recentBookings || [], 
      services: stats.services || [],
      centres: stats.centres || [],
      infraActions: stats.infraActions || [],
    });

  } catch (err) {
    console.error('Dashboard API error:', err);
    return apiError('Failed to load dashboard', 500);
  }
}