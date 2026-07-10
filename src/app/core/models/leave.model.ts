export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id?: string;
  uid: string;
  employeeName: string;
  from: string; // 'YYYY-MM-DD'
  to: string; // 'YYYY-MM-DD'
  reason: string;
  status: LeaveStatus;
  createdAt?: number;
}
