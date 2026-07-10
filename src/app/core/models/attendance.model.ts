export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  id?: string;
  uid: string;
  employeeName: string;
  date: string; // 'YYYY-MM-DD'
  status: AttendanceStatus;
  createdAt?: number;
}
