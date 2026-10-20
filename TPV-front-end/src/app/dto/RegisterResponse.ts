export interface RegisterResponse {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    userRole: UserRole;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    ANALYST = 'ANALYST',
}