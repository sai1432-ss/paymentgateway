import * as db from '../db.js';

export const getTransactions = async (req, res) => {
    const merchant_id = req.merchant.id; // From auth middleware
    try {
        const result = await db.query(
            'SELECT * FROM payments WHERE merchant_id = $1 ORDER BY created_at DESC',
            [merchant_id]
        );
        res.status(200).json({ transactions: result.rows });
    } catch (error) {
        res.status(500).json({ error: { code: "SERVER_ERROR", description: "Internal error" } });
    }
};