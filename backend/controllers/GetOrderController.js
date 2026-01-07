import * as db from '../db.js';

export const getOrder = async (req, res) => {
    // 1. Extract order_id from the URL path
    const { order_id } = req.params;
    
    // 2. Extract merchant_id from the authenticated request
    // req.merchant is populated by the authenticateMerchant middleware
    const merchant_id = req.merchant.id;

    try {
        // 3. Query database for the specific order belonging to this merchant
        const queryText = `
            SELECT id, merchant_id, amount, currency, receipt, notes, status, created_at, updated_at 
            FROM orders 
            WHERE id = $1 AND merchant_id = $2
        `;
        
        const result = await db.query(queryText, [order_id, merchant_id]);

        // 4. Handle missing orders
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND_ERROR",
                    description: "Order not found"
                }
            });
        }

        const order = result.rows[0];

        // 5. Return 200 OK with ISO 8601 timestamps
        // This confirms the current status (e.g., 'created' or 'paid')
        res.status(200).json({
            id: order.id,
            merchant_id: order.merchant_id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
            status: order.status,
            created_at: order.created_at.toISOString(),
            updated_at: order.updated_at.toISOString()
        });

    } catch (error) {
        console.error("Get Order Error:", error);
        res.status(500).json({ 
            error: { 
                code: "SERVER_ERROR", 
                description: "Internal server error" 
            } 
        });
    }
};