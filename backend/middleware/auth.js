// backend/middleware/auth.js
import * as db from '../db.js';

export const authenticateMerchant = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    if (!apiKey || !apiSecret) {
        return res.status(401).json({
            error: { code: "AUTHENTICATION_ERROR", description: "Invalid API credentials" }
        });
    }

    // --- 🟢 NEW: Test Mode Bypass ---
    // This allows you to test WITHOUT seeding the database first
    if (apiKey === process.env.TEST_API_KEY && apiSecret === process.env.TEST_API_SECRET) {
        req.merchant = { 
            id: '550e8400-e29b-41d4-a716-446655440000', // Mock Merchant ID
            name: 'Test Merchant' 
        };
        return next();
    }

    // --- Database Lookup ---
    try {
        const result = await db.query(
            'SELECT id, name FROM merchants WHERE api_key = $1 AND api_secret = $2 AND is_active = true',
            [apiKey, apiSecret]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: { code: "AUTHENTICATION_ERROR", description: "Invalid API credentials" }
            });
        }

        req.merchant = result.rows[0];
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ error: { code: "SERVER_ERROR", description: "Internal server error" } });
    }
};