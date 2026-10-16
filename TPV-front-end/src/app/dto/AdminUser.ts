export interface AdminUser {
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  frozen: boolean;
  active: boolean;
}
