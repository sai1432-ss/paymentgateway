// backend/controllers/TestController.js
import * as db from '../db.js';

export const getTestMerchant = async (req, res) => {
    try {
        // 1. Get the test email from environment variables
        const testEmail = process.env.TEST_MERCHANT_EMAIL || 'test@example.com';

        // 2. Query for the merchant using the dynamic email
        const queryText = `
            SELECT id, email, api_key, true as seeded 
            FROM merchants 
            WHERE email = $1
        `;
        
        const result = await db.query(queryText, [testEmail]);

        // 3. Handle case where test merchant is missing
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND_ERROR",
                    description: `Test merchant with email ${testEmail} doesn't exist`
                }
            });
        }

        // 4. Return 200 OK with the merchant details
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Test Endpoint Error:", error);
        res.status(500).json({ 
            error: { 
                code: "SERVER_ERROR", 
                description: "Internal server error" 
            } 
        });
    }
};