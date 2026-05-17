import { NextRequest } from 'next/server';
import { getSessionUser, apiResponse, apiError } from '@/lib/auth';
import { getStations, createStation } from '@/lib/firestore';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 401);
  
  try {
    const stations = await getStations();
    return apiResponse(stations);
  } catch (error) {
    console.error("GET STATIONS ERROR:", error);
    return apiError('Failed to fetch stations', 500);
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser() as any;
  
  if (!user || user.role !== 'admin') {
    return apiError('Forbidden: Admin access required', 403);
  }
  
  try {
    const body = await req.json();
    if (!body.stationName || !body.stationAddress) {
      return apiError('Station name and address are required', 400);
    }

    // Bina objek mengikut skema DB yang anda berikan sebelum ini
    const stationData = {
      stationName: body.stationName,
      stationAddress: body.stationAddress,
      chargerPowerKw: Number(body.chargerPowerKw) || 22,
      pricePerKwh: Number(body.pricePerKwh) || 1.1,
      latitude: Number(body.latitude) || 3.1390, // Default KL lat jika tiada
      longitude: Number(body.longitude) || 101.6869, // Default KL long jika tiada
      status: 'active',
      startTime: new Date().toISOString(), 
      userId: user.id || user.uid, // Gunakan fallback jika key berbeza
      endTime: null,
      startBatteryPercent: Number(body.startBatteryPercent) || 0,
      targetBatteryPercent: Number(body.targetBatteryPercent) || 80,
      vehicleId: body.vehicleId || "N/A",
      vehicleName: body.vehicleName || "Unknown Vehicle"
    };

    const id = await createStation(stationData);
    
    return apiResponse({ 
      id, 
      message: 'Station created successfully',
      success: true 
    }, 201);
    
  } catch (error) {
    console.error("POST STATION ERROR:", error);
    return apiError('Failed to create station. Check your request body.', 400);
  }
}