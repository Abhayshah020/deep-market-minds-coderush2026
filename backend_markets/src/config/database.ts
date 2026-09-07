import "dotenv/config";

import { Sequelize } from "sequelize";

const DATABASE_URL =
    process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is not defined in environment variables",
    );
}

export const sequelize = new Sequelize(
    DATABASE_URL,
    {
        dialect: "postgres",
        logging: false,
    },
);

export async function connectDatabase(): Promise<void> {
    try {
        await sequelize.authenticate();

        console.log(
            "PostgreSQL database connected successfully",
        );

        // Create/update tables from Sequelize models.
        await sequelize.sync();

        console.log(
            "Database models synchronized successfully",
        );
    } catch (error) {
        console.error(
            "Failed to connect to PostgreSQL:",
            error,
        );

        throw error;
    }
}
