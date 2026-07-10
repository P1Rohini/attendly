export type UserRole = 'employee' | 'manager';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}
