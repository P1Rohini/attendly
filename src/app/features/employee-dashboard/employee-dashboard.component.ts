import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { LeaveService } from '../../core/services/leave.service';
import { AttendanceRecord, AttendanceStatus } from '../../core/models/attendance.model';
import { LeaveRequest } from '../../core/models/leave.model';
import { AppUser } from '../../core/models/app-user.model';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './employee-dashboard.component.html'
})
export class EmployeeDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private leaveService = inject(LeaveService);

  appUser$!: Observable<AppUser | null>;
  attendance$!: Observable<AttendanceRecord[]>;
  leaveRequests$!: Observable<LeaveRequest[]>;

  /** month filter, 'YYYY-MM'; empty string = all months */
  monthFilter = new Date().toISOString().slice(0, 7);

  attendanceForm = this.fb.nonNullable.group({
    date: [todayIso(), Validators.required],
    status: ['present' as AttendanceStatus, Validators.required]
  });

  leaveForm = this.fb.nonNullable.group({
    from: [todayIso(), Validators.required],
    to: [todayIso(), Validators.required],
    reason: ['', Validators.required]
  });

  editingId: string | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.appUser$ = this.authService.appUser$;

    this.attendance$ = this.appUser$.pipe(
      switchMap((appUser) => (appUser ? this.attendanceService.listForUser(appUser.uid) : []))
    );

    this.leaveRequests$ = this.appUser$.pipe(
      switchMap((appUser) => (appUser ? this.leaveService.listForUser(appUser.uid) : []))
    );
  }

  filteredAttendance(records: AttendanceRecord[]): AttendanceRecord[] {
    if (!this.monthFilter) return records;
    return records.filter((r) => r.date.startsWith(this.monthFilter));
  }

  presentCount(records: AttendanceRecord[]): number {
    return this.filteredAttendance(records).filter((r) => r.status === 'present').length;
  }

  pendingLeaveCount(requests: LeaveRequest[]): number {
    return requests.filter((r) => r.status === 'pending').length;
  }

  async submitAttendance(appUser: AppUser): Promise<void> {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }
    const { date, status } = this.attendanceForm.getRawValue();
    this.errorMessage = '';
    try {
      if (this.editingId) {
        await this.attendanceService.updateAttendance(this.editingId, { date, status });
        this.editingId = null;
      } else {
        await this.attendanceService.markAttendance({
          uid: appUser.uid,
          employeeName: appUser.displayName,
          date,
          status
        });
      }
      this.attendanceForm.reset({ date: todayIso(), status: 'present' });
    } catch {
      this.errorMessage = 'Could not save attendance. Try again.';
    }
  }

  editRecord(record: AttendanceRecord): void {
    this.editingId = record.id ?? null;
    this.attendanceForm.setValue({ date: record.date, status: record.status });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.attendanceForm.reset({ date: todayIso(), status: 'present' });
  }

  async deleteRecord(id?: string): Promise<void> {
    if (!id) return;
    this.errorMessage = '';
    try {
      await this.attendanceService.deleteAttendance(id);
    } catch {
      this.errorMessage = 'Could not delete that record. Try again.';
    }
  }

  async submitLeave(appUser: AppUser): Promise<void> {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }
    const { from, to, reason } = this.leaveForm.getRawValue();
    if (to < from) {
      this.errorMessage = '"To" date cannot be before "from" date.';
      return;
    }
    this.errorMessage = '';
    try {
      await this.leaveService.requestLeave({
        uid: appUser.uid,
        employeeName: appUser.displayName,
        from,
        to,
        reason
      });
      this.leaveForm.reset({ from: todayIso(), to: todayIso(), reason: '' });
    } catch {
      this.errorMessage = 'Could not submit that leave request. Try again.';
    }
  }
}
