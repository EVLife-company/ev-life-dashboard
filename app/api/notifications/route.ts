import { NextRequest } from 'next/server';
import { getSessionUser, apiResponse, apiError } from '@/lib/auth';
import { 
  getNotifications, 
  createNotification, 
  updateNotification, 
  deleteNotification,
  getUserPushToken // You will need to create this helper in lib/firestore
} from '@/lib/firestore';

export async function GET() {
  const user = await getSessionUser();
  // Allow admins and service centers to see notifications
  if (!user || (user.role !== 'admin' && user.role !== 'service_centre')) {
    return apiError('Forbidden', 403);
  }
  const notifs = await getNotifications();
  return apiResponse(notifs);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  
  // Allow servicecentre role to send "Repair Complete" notifications
  if (!user || (user.role !== 'admin' && user.role !== 'service_centre')) {
    return apiError('Forbidden', 403);
  }

  const body = await req.json();
  const { title, message, targetUserId, type } = body;

  if (!title || !message || !targetUserId) {
    return apiError('Title, message, and targetUserId are required', 400);
  }

  // 1. Save to Firestore (for the user's in-app notification list)
  const id = await createNotification({ 
    title, 
    message, 
    userId: targetUserId, 
    type: type || 'info',
    createdAt: new Date()
  });

  // 2. Fetch the target user's Expo Push Token from Firestore
  const expoPushToken = await getUserPushToken(targetUserId);

  // 3. Trigger the Push Notification via Expo API
  if (expoPushToken) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          to: expoPushToken,
          title: title,
          body: message,
          sound: 'default',
          data: { notificationId: id }, // Optional: link to the Firestore doc
        }),
      });
    } catch (error) {
      console.error('Push Notification Error:', error);
      // We don't return an error here because the Firestore entry was still created
    }
  }

  return apiResponse({ id, success: true }, 201);
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return apiError('Forbidden', 403);
  const { id, ...data } = await req.json();
  await updateNotification(id, data);
  return apiResponse({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return apiError('Forbidden', 403);
  const { id } = await req.json();
  await deleteNotification(id);
  return apiResponse({ success: true });
}