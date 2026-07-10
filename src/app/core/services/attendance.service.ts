import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AttendanceRecord } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private firestore = inject(Firestore);
  private collectionRef = collection(this.firestore, 'attendance');

  /** All attendance records for one employee, newest first. */
  listForUser(uid: string): Observable<AttendanceRecord[]> {
    const q = query(this.collectionRef, where('uid', '==', uid), orderBy('date', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<AttendanceRecord[]>;
  }

  /** All attendance records across everyone, newest first (manager view). */
  listAll(): Observable<AttendanceRecord[]> {
    const q = query(this.collectionRef, orderBy('date', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<AttendanceRecord[]>;
  }

  async markAttendance(record: Omit<AttendanceRecord, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(this.collectionRef, { ...record, createdAt: Date.now() });
  }

  async updateAttendance(id: string, changes: Partial<AttendanceRecord>): Promise<void> {
    const ref = doc(this.firestore, `attendance/${id}`);
    await updateDoc(ref, changes);
  }

  async deleteAttendance(id: string): Promise<void> {
    const ref = doc(this.firestore, `attendance/${id}`);
    await deleteDoc(ref);
  }
}
