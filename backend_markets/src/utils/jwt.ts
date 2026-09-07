import "dotenv/config";

import jwt, {
    type SignOptions,
} from "jsonwebtoken";

import type {
    JwtPayload,
} from "../types/auth.types.js";

const JWT_SECRET =
    process.env.JWT_SECRET;

const JWT_EXPIRES_IN =
    process.env.JWT_EXPIRES_IN ?? "7d";

if (!JWT_SECRET) {
    throw new Error(
        "JWT_SECRET is not defined in environment variables",
    );
}

const secret: string = JWT_SECRET;

export function generateToken(
    payload: JwtPayload,
): string {
    const options: SignOptions = {
        expiresIn:
            JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };

    return jwt.sign(
        payload,
        secret,
        options,
    );
}

export function verifyToken(
    token: string,
): JwtPayload {
    const decoded = jwt.verify(
        token,
        secret,
    );

    if (
        typeof decoded === "string" ||
        !decoded ||
        typeof decoded !== "object"
    ) {
        throw new Error(
            "Invalid JWT payload",
        );
    }

    if (
        typeof decoded.userId !== "string" ||
        typeof decoded.email !== "string"
    ) {
        throw new Error(
            "Invalid JWT payload",
        );
    }

    return {
        userId: decoded.userId,
        email: decoded.email,
    };
}