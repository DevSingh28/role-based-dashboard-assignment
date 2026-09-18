import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db/dbconnect.js";


// Resolve current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Path to provided JSON data
const dataPath = path.join(
    __dirname,
    "../providedData/data.json"
);


// Read JSON file
const data = JSON.parse(
    fs.readFileSync(dataPath, "utf-8")
);


const { students, courses } = data;


// Seed database
const seedDatabase = async () => {

    const client = await pool.connect();

    try {

        // Start transaction
        await client.query("BEGIN");


        // ---------------------------------------------
        // Insert courses
        // ---------------------------------------------

        for (const course of courses) {

            await client.query(
                `
                INSERT INTO courses (
                    id,
                    title,
                    category,
                    level,
                    instructor,
                    duration_weeks
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                `,
                [
                    course.id,
                    course.title,
                    course.category,
                    course.level,
                    course.instructor,
                    course.duration_weeks
                ]
            );
        }


        // ---------------------------------------------
        // Insert students
        // ---------------------------------------------

        for (const student of students) {

            await client.query(
                `
                INSERT INTO students (
                    id,
                    name,
                    region,
                    joined_on
                )
                VALUES ($1, $2, $3, $4)
                `,
                [
                    student.id,
                    student.name,
                    student.region,
                    student.joined_on
                ]
            );
        }


        // ---------------------------------------------
        // Insert enrollments
        // ---------------------------------------------

        for (const student of students) {

            for (const enrollment of student.enrollments) {

                await client.query(
                    `
                    INSERT INTO enrollments (
                        student_id,
                        course_id,
                        enrolled_on,
                        completion_status,
                        grade,
                        rating,
                        fee_paid
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `,
                    [
                        student.id,
                        enrollment.course_id,
                        enrollment.enrolled_on,
                        enrollment.completion_status,
                        enrollment.grade,
                        enrollment.rating,
                        enrollment.fee_paid
                    ]
                );
            }
        }


        // Everything succeeded
        await client.query("COMMIT");

        console.log("Database seeded successfully.");


    } catch (error) {

        // Something failed → undo everything
        await client.query("ROLLBACK");

        console.error("Database seeding failed:");
        console.error(error);

        process.exitCode = 1;


    } finally {

        client.release();
        await pool.end();
    }
};


seedDatabase();