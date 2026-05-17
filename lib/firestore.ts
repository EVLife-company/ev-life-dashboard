import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, where,
  serverTimestamp, setDoc, Timestamp, limit,
} from 'firebase/firestore';
import { db } from './firebase-client';

/** 
 * Helper to convert Firestore Timestamps to ISO Strings safely 
 */
function tsToStr(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (typeof ts === 'string') return ts;
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (ts?.toDate) return ts.toDate().toISOString();
  return new Date().toISOString();
}

// ── BOOKINGS ──────────────────────────────────────────
export async function getBookings(centreFilter?: string) {
  let q = centreFilter
    ? query(
        collection(db, 'bookings'),
        where('serviceCentreName', '==', centreFilter),
        orderBy('createdAt', 'desc')
      )
    : query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));

  const snap = await getDocs(q);

  return snap.docs.map(d => {
    const data = d.data() as any;
    return {
      id: d.id,
      userName: data.userName,
      userEmail: data.userEmail,
      userId: data.userId, // Added to ensure notifications can find the user
      service: data.serviceTypeName,       
      centre: data.serviceCentreName,      
      date: data.bookingDate,              
      time: data.bookingTime,            
      amount: data.amount || 0,
      status: data.status,
      createdAt: tsToStr(data.createdAt),
      updatedAt: tsToStr(data.updatedAt),
    };
  });
}

/**
 * REPAIRED: Functional syntax for Client SDK
 */
export async function getUserPushToken(userId: string) {
  try {
    // doc(db, collection, documentId)
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data()?.expoPushToken || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching push token:", error);
    return null;
  }
}

export async function getBookingById(id: string) {
  try {
    const snap = await getDoc(doc(db, 'bookings', id));
    if (!snap.exists()) return null;
    const d = snap.data();
    return { 
      id: snap.id, 
      ...d, 
      createdAt: tsToStr(d.createdAt), 
      updatedAt: tsToStr(d.updatedAt) 
    };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
}

export async function createBooking(data: any) {
  const ref = await addDoc(collection(db, 'bookings'), { 
    ...data, 
    status: 'pending', 
    createdAt: serverTimestamp(), 
    updatedAt: serverTimestamp() 
  });
  return ref.id;
}

export async function updateBooking(id: string, data: any) {
  await updateDoc(doc(db, 'bookings', id), { 
    ...data, 
    updatedAt: serverTimestamp() 
  });
}

export async function deleteBooking(id: string) {
  await deleteDoc(doc(db, 'bookings', id));
}

// ── USERS ─────────────────────────────────────────────
export async function getUsers() {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ 
    id: d.id, 
    ...d.data(), 
    createdAt: tsToStr((d.data() as any).createdAt) 
  }));
}

export async function updateUser(id: string, data: any) {
  await updateDoc(doc(db, 'users', id), { 
    ...data, 
    updatedAt: serverTimestamp() 
  });
}

export async function deleteUser(id: string) {
  await deleteDoc(doc(db, 'users', id));
}

export async function createUser(data: any) {
  const ref = await addDoc(collection(db, 'users'), { 
    ...data, 
    createdAt: serverTimestamp() 
  });
  return ref.id;
}

// ── CENTRES ───────────────────────────────────────────
export async function getCentres() {
  const q = query(collection(db, 'centres'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ 
    id: d.id, 
    ...d.data(), 
    createdAt: tsToStr((d.data() as any).createdAt) 
  }));
}

export async function createCentre(data: any) {
  const ref = await addDoc(collection(db, 'centres'), { 
    ...data, 
    rating: 0, 
    status: 'active', 
    createdAt: serverTimestamp() 
  });
  return ref.id;
}

export async function updateCentre(id: string, data: any) {
  await updateDoc(doc(db, 'centres', id), { 
    ...data, 
    updatedAt: serverTimestamp() 
  });
}

export async function deleteCentre(id: string) {
  await deleteDoc(doc(db, 'centres', id));
}

// ── STATIONS ──────────────────────────────────────────
export async function getStations() {
  try {
    // Gunakan nama koleksi yang betul: chargingSessions
    const stationsRef = collection(db, 'chargingSessions');
    const q = query(stationsRef, orderBy('startTime', 'desc'));
    
    const snap = await getDocs(q);
    
    return snap.docs.map(d => ({ 
      id: d.id, 
      ...d.data() 
    }));
  } catch (error) {
    console.error("Firestore Error:", error);
    // Fallback: Jika 'orderBy' gagal (sebab index tak ada), buat fetch biasa
    const snap = await getDocs(collection(db, 'chargingSessions'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

export async function createStation(data: any) {
  const docRef = await addDoc(collection(db, 'chargingSessions'), data);
  return docRef.id;
}

export async function updateStation(id: string, data: any) {
  await updateDoc(doc(db, 'stations', id), { 
    ...data, 
    updatedAt: serverTimestamp() 
  });
}

export async function deleteStation(id: string) {
  await deleteDoc(doc(db, 'stations', id));
}

// ── NOTIFICATIONS ─────────────────────────────────────
export async function getNotifications() {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ 
    id: d.id, 
    ...d.data(), 
    createdAt: tsToStr((d.data() as any).createdAt) 
  }));
}

export async function createNotification(data: any) {
  const ref = await addDoc(collection(db, 'notifications'), { 
    ...data, 
    read: false, 
    createdAt: serverTimestamp() 
  });
  return ref.id;
}

export async function updateNotification(id: string, data: any) {
  await updateDoc(doc(db, 'notifications', id), data);
}

export async function deleteNotification(id: string) {
  await deleteDoc(doc(db, 'notifications', id));
}

// ── DASHBOARD STATS ───────────────────────────────────
export async function getDashboardStats(centreFilter?: string) {
  const [bookingsSnap, usersSnap, centresSnap, stationsSnap] = await Promise.all([
    getDocs(
      centreFilter
        ? query(collection(db, 'bookings'), where('serviceCentreName', '==', centreFilter))
        : collection(db, 'bookings')
    ),
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'centres')),
    getDocs(collection(db, 'stations')),
  ]);

  const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  const centresRaw = centresSnap.docs.map(d => d.data() as any);

  // ======================
  // STATUS COUNTS
  // ======================
  const pending = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;

  // ======================
  // REVENUE
  // ======================
  const revenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((s, b) => s + (Number(b.amount) || 0), 0);

  // ======================
  // SERVICES (FROM BOOKINGS)
  // ======================
  const serviceMap: Record<string, number> = {};

  bookings.forEach((b: any) => {
    if (!b.service) return;
    serviceMap[b.service] = (serviceMap[b.service] || 0) + 1;
  });

  const services = Object.entries(serviceMap).map(([name, count]) => ({
    name,
    count,
  }));

  // ======================
  // CENTRES LIST
  // ======================
  const centres = centresRaw.map(c => ({
    name: c.name || c.serviceCentreName,
    city: c.city || '—',
  }));

  // ======================
  // ACTIONS (FOR UI BUTTONS)
  // ======================
  const infraActions = [
    { id: '1', label: 'Add Centre' },
    { id: '2', label: 'Manage Services' },
    { id: '3', label: 'View Stations' },
  ];

  // ======================
  // RECENT BOOKINGS
  // ======================
  const recentBookings = [...bookings]
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    })
    .slice(0, 5)
    .map(b => ({
      ...b,
      createdAt: tsToStr(b.createdAt),
      updatedAt: tsToStr(b.updatedAt),
    }));

  // ======================
  // RETURN
  // ======================
  return {
    totalUsers: usersSnap.size,
    totalBookings: bookings.length,
    pendingBookings: pending,
    confirmedBookings: confirmed,
    completedBookings: completed,
    cancelledBookings: cancelled,
    totalRevenue: revenue,
    totalCentres: centresSnap.size,
    totalStations: stationsSnap.size,
    recentBookings,

    // 🔥 NEW DATA
    services,
    centres,
    infraActions,
  };
}