import * as db from '../db.js';

export const getPublicOrder = async (req, res) => {
    const { order_id } = req.params;

    try {
        // Query only basic info needed for the checkout UI
        const queryText = 'SELECT id, amount, currency, status FROM orders WHERE id = $1';
        const result = await db.query(queryText, [order_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = result.rows[0];
        
        // Return only the fields necessary for the customer
        res.status(200).json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            status: order.status
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};