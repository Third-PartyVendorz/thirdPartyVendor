export interface UserContext {
    userId: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: Date;
    email: string;
    role: 'USER' | 'ADMIN';
}