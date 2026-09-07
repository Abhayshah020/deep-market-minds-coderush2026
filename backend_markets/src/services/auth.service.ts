import bcrypt from "bcrypt";

import { User } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";

import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from "../types/auth.types.js";

const SALT_ROUNDS = 12;

export async function registerUser(
    data: RegisterRequest,
): Promise<AuthResponse> {
    const username = data.username.trim();

    const email = data.email
        .trim()
        .toLowerCase();

    const existingUser =
        await User.findOne({
            where: {
                email,
            },
        });

    if (existingUser) {
        throw new Error(
            "An account with this email already exists",
        );
    }

    const hashedPassword =
        await bcrypt.hash(
            data.password,
            SALT_ROUNDS,
        );

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    const token = generateToken({
        userId: user.id,
        email: user.email,
    });

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
        token,
    };
}

export async function loginUser(
    data: LoginRequest,
): Promise<AuthResponse> {
    const email = data.email
        .trim()
        .toLowerCase();

    const user = await User.findOne({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error(
            "Invalid email or password",
        );
    }

    const passwordValid =
        await bcrypt.compare(
            data.password,
            user.password,
        );

    if (!passwordValid) {
        throw new Error(
            "Invalid email or password",
        );
    }

    const token = generateToken({
        userId: user.id,
        email: user.email,
    });

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
        token,
    };
}