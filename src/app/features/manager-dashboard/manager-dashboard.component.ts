import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { AttendanceService } from '../../core/services/attendance.service';
import { LeaveService } from '../../core/services/leave.service';
import { AttendanceRecord } from '../../core/models/attendance.model';
import { LeaveRequest, LeaveStatus } from '../../core/models/leave.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-dashboard.component.html'
})
export class ManagerDashboardComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private leaveService = inject(LeaveService);

  attendance$!: Observable<AttendanceRecord[]>;
  leaveRequests$!: Observable<LeaveRequest[]>;

  monthFilter = new Date().toISOString().slice(0, 7);
  employeeFilter = '';
  errorMessage = '';

  ngOnInit(): void {
    this.attendance$ = this.attendanceService.listAll();
    this.leaveRequests$ = this.leaveService.listAll();
  }

  employeeNames(records: AttendanceRecord[]): string[] {
    return Array.from(new Set(records.map((r) => r.employeeName))).sort();
  }

  filteredAttendance(records: AttendanceRecord[]): AttendanceRecord[] {
    return records
      .filter((r) => !this.monthFilter || r.date.startsWith(this.monthFilter))
      .filter((r) => !this.employeeFilter || r.employeeName === this.employeeFilter);
  }

  filteredLeave(requests: LeaveRequest[]): LeaveRequest[] {
    return requests
      .filter((r) => !this.monthFilter || r.from.startsWith(this.monthFilter) || r.to.startsWith(this.monthFilter))
      .filter((r) => !this.employeeFilter || r.employeeName === this.employeeFilter);
  }

  presentCount(records: AttendanceRecord[]): number {
    return this.filteredAttendance(records).filter((r) => r.status === 'present').length;
  }

  pendingCount(requests: LeaveRequest[]): number {
    return this.filteredLeave(requests).filter((r) => r.status === 'pending').length;
  }

  async setStatus(id: string | undefined, status: LeaveStatus): Promise<void> {
    if (!id) return;
    this.errorMessage = '';
    try {
      await this.leaveService.setStatus(id, status);
    } catch {
      this.errorMessage = 'Could not update that request. Check your connection and try again.';
    }
  }
}