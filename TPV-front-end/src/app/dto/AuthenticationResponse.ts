export interface AuthenticationResponse {
    jwtToken: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: Date;
    email: string;
}