import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { LeaveRequest, LeaveStatus } from '../models/leave.model';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private firestore = inject(Firestore);
  private collectionRef = collection(this.firestore, 'leave');

  /** All leave requests for one employee, newest first. */
  listForUser(uid: string): Observable<LeaveRequest[]> {
    const q = query(this.collectionRef, where('uid', '==', uid), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<LeaveRequest[]>;
  }

  /** All leave requests across everyone, newest first (manager view). */
  listAll(): Observable<LeaveRequest[]> {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<LeaveRequest[]>;
  }

  async requestLeave(req: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>): Promise<void> {
    await addDoc(this.collectionRef, { ...req, status: 'pending' as LeaveStatus, createdAt: Date.now() });
  }

  async setStatus(id: string, status: LeaveStatus): Promise<void> {
    const ref = doc(this.firestore, `leave/${id}`);
    await updateDoc(ref, { status });
  }
}
