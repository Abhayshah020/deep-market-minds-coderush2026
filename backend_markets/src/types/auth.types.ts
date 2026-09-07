export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    username: string;
    email: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}

export interface JwtPayload {
    userId: string;
    email: string;
}