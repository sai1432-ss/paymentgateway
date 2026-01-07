import * as db from '../db.js';

export const getPublicPaymentStatus = async (req, res) => {
    const { payment_id } = req.params;

    try {
        // Query only the status and ID for security
        const queryText = 'SELECT id, status, amount, currency FROM payments WHERE id = $1';
        const result = await db.query(queryText, [payment_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: { code: "NOT_FOUND_ERROR", description: "Payment not found" } 
            });
        }

        // This returns the status ('processing' or 'success') to the frontend
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Public Payment Status Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};