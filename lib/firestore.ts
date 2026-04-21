import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, where,
  serverTimestamp, setDoc, Timestamp, limit,
} from 'firebase/firestore';
import { db } from './firebase-client';

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

export async function getBookingById(id: string) {
  const snap = await getDoc(doc(db, 'bookings', id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { id: snap.id, ...d, createdAt: tsToStr(d.createdAt), updatedAt: tsToStr(d.updatedAt) };
}

export async function createBooking(data: any) {
  const ref = await addDoc(collection(db, 'bookings'), { ...data, status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateBooking(id: string, data: any) {
  await updateDoc(doc(db, 'bookings', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteBooking(id: string) {
  await deleteDoc(doc(db, 'bookings', id));
}

// ── USERS ─────────────────────────────────────────────
export async function getUsers() {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: tsToStr((d.data() as any).createdAt) }));
}

export async function updateUser(id: string, data: any) {
  await updateDoc(doc(db, 'users', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteUser(id: string) {
  await deleteDoc(doc(db, 'users', id));
}

export async function createUser(data: any) {
  const ref = await addDoc(collection(db, 'users'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

// ── CENTRES ───────────────────────────────────────────
export async function getCentres() {
  const snap = await getDocs(query(collection(db, 'centres'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: tsToStr((d.data() as any).createdAt) }));
}

export async function createCentre(data: any) {
  const ref = await addDoc(collection(db, 'centres'), { ...data, rating: 0, status: 'active', createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateCentre(id: string, data: any) {
  await updateDoc(doc(db, 'centres', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCentre(id: string) {
  await deleteDoc(doc(db, 'centres', id));
}

// ── STATIONS ──────────────────────────────────────────
export async function getStations() {
  const snap = await getDocs(query(collection(db, 'stations'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: tsToStr((d.data() as any).createdAt) }));
}

export async function createStation(data: any) {
  const ref = await addDoc(collection(db, 'stations'), { ...data, sessions: 0, status: 'online', createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateStation(id: string, data: any) {
  await updateDoc(doc(db, 'stations', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteStation(id: string) {
  await deleteDoc(doc(db, 'stations', id));
}

// ── NOTIFICATIONS ─────────────────────────────────────
export async function getNotifications() {
  const snap = await getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: tsToStr((d.data() as any).createdAt) }));
}

export async function createNotification(data: any) {
  const ref = await addDoc(collection(db, 'notifications'), { ...data, read: false, createdAt: serverTimestamp() });
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
    getDocs(centreFilter
      ? query(collection(db, 'bookings'), where('centre', '==', centreFilter))
      : collection(db, 'bookings')),
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'centres')),
    getDocs(collection(db, 'stations')),
  ]);

  const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  const pending = bookings.filter((b: any) => b.status === 'pending').length;
  const confirmed = bookings.filter((b: any) => b.status === 'confirmed').length;
  const completed = bookings.filter((b: any) => b.status === 'completed').length;
  const cancelled = bookings.filter((b: any) => b.status === 'cancelled').length;
  const revenue = bookings
    .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((s: number, b: any) => s + (b.amount || 0), 0);

  const recentBookings = bookings
    .sort((a: any, b: any) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 5)
    .map((b: any) => ({ ...b, createdAt: tsToStr(b.createdAt), updatedAt: tsToStr(b.updatedAt) }));

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
  };
}
