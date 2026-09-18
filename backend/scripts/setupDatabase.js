import "dotenv/config";
import fs from "fs";
import path from "path";
import { Client } from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = new URL(process.env.DATABASE_URL);
const databaseName = databaseUrl.pathname.slice(1);

const adminUrl = new URL(process.env.DATABASE_URL);
adminUrl.pathname = "/postgres";

const schemaPath = path.join(__dirname, "../db/schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");

const sslConfig = {
    rejectUnauthorized: false
};

const setupDatabase = async () => {
    const adminClient = new Client({
        connectionString: adminUrl.toString(),
        ssl: sslConfig
    });

    try {
        await adminClient.connect();

        const databaseExists = await adminClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [databaseName]
        );

        if (databaseExists.rowCount === 0) {
            await adminClient.query(
                `CREATE DATABASE "${databaseName}"`
            );

            console.log(`Database "${databaseName}" created.`);
        } else {
            console.log(`Database "${databaseName}" already exists.`);
        }
    } catch (error) {
        console.error("Database creation failed:", error);
        process.exitCode = 1;
        return;
    } finally {
        await adminClient.end();
    }

    const databaseClient = new Client({
        connectionString: databaseUrl.toString(),
        ssl: sslConfig
    });

    try {
        await databaseClient.connect();

        await databaseClient.query(schema);

        console.log("Database schema created successfully.");
    } catch (error) {
        console.error("Schema setup failed:", error);
        process.exitCode = 1;
    } finally {
        await databaseClient.end();
    }
};

setupDatabase();