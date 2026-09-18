import pool from "../db/dbconnect.js";
import { allowedRoles } from "../utilities/allowedRoles.js";

export const GetRevenueByCategory = async (req, res) => {
    try {
        const { role, region: userRegion } = req.user;
        const requestedRegion = req.query.region;

        

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                message: "You are not authorized to access this resource!"
            });
        }

        let effectiveRegion = null;

        if (role === "admin") {
            if (requestedRegion) {
                const allowedRegions = ["North", "South", "East"];

                if (!allowedRegions.includes(requestedRegion)) {
                    return res.status(400).json({
                        message: "Invalid region!"
                    });
                }

                effectiveRegion = requestedRegion;
            }
        } else {
            if (requestedRegion && requestedRegion !== userRegion) {
                return res.status(403).json({
                    message: "You are not authorized to access this region!"
                });
            }

            effectiveRegion = userRegion;
        }

        let query = `
            SELECT
                c.category,
                SUM(e.fee_paid) AS total_revenue
            FROM enrollments e
            JOIN students s
                ON e.student_id = s.id
            JOIN courses c
                ON e.course_id = c.id
        `;

        const values = [];

        if (effectiveRegion) {
            query += `
                WHERE s.region = $1
            `;

            values.push(effectiveRegion);
        }

        query += `
            GROUP BY c.category
            ORDER BY c.category
        `;

        const result = await pool.query(query, values);

        const data = result.rows.map((row) => ({
            category: row.category,
            totalRevenue: Number(row.total_revenue)
        }));

        return res.status(200).json({
            data
        });

    } catch (error) {
        console.error("[Revenue By Category Error]:", error);

        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
};

export const GetDashboardInsights = async (req, res) => {
    try {
        const { role, region: userRegion } = req.user;
        const requestedRegion = req.query.region;

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                message: "You are not authorized to access this resource!"
            });
        }

        let effectiveRegion = null;

        if (role === "admin") {
            if (requestedRegion) {
                const allowedRegions = ["North", "South", "East"];

                if (!allowedRegions.includes(requestedRegion)) {
                    return res.status(400).json({
                        message: "Invalid region!"
                    });
                }

                effectiveRegion = requestedRegion;
            }
        } else {
            if (requestedRegion && requestedRegion !== userRegion) {
                return res.status(403).json({
                    message: "You are not authorized to access this region!"
                });
            }

            effectiveRegion = userRegion;
        }

        const values = [];
        const regionCondition = effectiveRegion
            ? "WHERE s.region = $1"
            : "";

        if (effectiveRegion) {
            values.push(effectiveRegion);
        }

        const overviewQuery = `
            SELECT
                COUNT(DISTINCT s.id) AS students,
                COUNT(e.id) AS enrollments,
                ROUND(
                    COUNT(*) FILTER (
                        WHERE e.completion_status = 'completed'
                    ) * 100.0 / NULLIF(COUNT(e.id), 0),
                    1
                ) AS completion_rate,
                ROUND(AVG(e.rating), 2) AS average_rating
            FROM students s
            LEFT JOIN enrollments e
                ON e.student_id = s.id
            ${regionCondition}
        `;

        const completionByCategoryQuery = `
            SELECT
                c.category,
                COUNT(e.id) AS enrollments,
                ROUND(
                    COUNT(*) FILTER (
                        WHERE e.completion_status = 'completed'
                    ) * 100.0 / NULLIF(COUNT(e.id), 0),
                    1
                ) AS completion_rate
            FROM enrollments e
            JOIN students s
                ON e.student_id = s.id
            JOIN courses c
                ON e.course_id = c.id
            ${regionCondition}
            GROUP BY c.category
            ORDER BY completion_rate DESC
        `;

        const courseHealthQuery = `
            SELECT
                c.id,
                c.title,
                c.category,
                COUNT(e.id) AS enrollments,
                ROUND(AVG(e.rating), 2) AS average_rating,
                ROUND(
                    COUNT(*) FILTER (
                        WHERE e.completion_status = 'completed'
                    ) * 100.0 / NULLIF(COUNT(e.id), 0),
                    1
                ) AS completion_rate
            FROM enrollments e
            JOIN students s
                ON e.student_id = s.id
            JOIN courses c
                ON e.course_id = c.id
            ${regionCondition}
            GROUP BY c.id, c.title, c.category
            ORDER BY enrollments DESC
        `;

        const [
            overviewResult,
            completionResult,
            courseHealthResult
        ] = await Promise.all([
            pool.query(overviewQuery, values),
            pool.query(completionByCategoryQuery, values),
            pool.query(courseHealthQuery, values)
        ]);

        const overview = overviewResult.rows[0];

        return res.status(200).json({
            data: {
                overview: {
                    students: Number(overview.students),
                    enrollments: Number(overview.enrollments),
                    completionRate: Number(overview.completion_rate || 0),
                    averageRating: Number(overview.average_rating || 0)
                },

                completionByCategory: completionResult.rows.map((row) => ({
                    category: row.category,
                    enrollments: Number(row.enrollments),
                    completionRate: Number(row.completion_rate)
                })),

                courseHealth: courseHealthResult.rows.map((row) => ({
                    id: row.id,
                    title: row.title,
                    category: row.category,
                    enrollments: Number(row.enrollments),
                    averageRating: Number(row.average_rating),
                    completionRate: Number(row.completion_rate)
                }))
            }
        });

    } catch (error) {
        console.error("[Dashboard Insights Error]:", error);

        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
};