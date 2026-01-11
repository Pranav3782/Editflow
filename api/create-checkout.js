export default async function handler(req, res) {
    console.log("API Handler invoked for:", req.url);
    console.log("Request Body:", req.body);

    // Environment variables are automatically injected by Vercel/Supabase
    let apiKey = process.env.DODO_PAYMENTS_API_KEY;

    if (!apiKey) {
        console.error("CRITICAL ERROR: DODO_PAYMENTS_API_KEY is missing in environment variables.");
        return res.status(500).json({ error: "Server Configuration Error: Missing Payment API Key. Please add DODO_PAYMENTS_API_KEY to your environment variables." });
    }

    // Set CORS headers to allow requests from the frontend
    // In production, we allow the request origin if it exists to support custom domains
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { plan, email, name } = req.body || {};

    // Basic input sanitization
    name = (name || '').toString().slice(0, 100).trim();
    email = (email || '').toString().toLowerCase().trim();

    if (!plan || !email) {
        return res.status(400).json({ error: "Missing required fields: plan and email are required." });
    }

    let productId = null;

    // Use environment variables for product IDs with fallbacks provided by user
    const PRO_PRODUCT_ID = process.env.DODO_PRO_PRODUCT_ID || "pdt_0NVzju3irGibeJfcJew4B";
    const AGENCY_PRODUCT_ID = process.env.DODO_AGENCY_PRODUCT_ID || "pdt_0NVzjybhDD1KGeDmXlWre";

    if (plan === "pro") {
        productId = PRO_PRODUCT_ID;
    }

    if (plan === "agency") {
        productId = AGENCY_PRODUCT_ID;
    }

    if (!productId) {
        return res.status(400).json({
            error: `Configuration Error: Product ID for plan "${plan}" is missing. Please add DODO_${plan.toUpperCase()}_PRODUCT_ID to your environment variables.`
        });
    }

    try {
        console.log("Sending request to Dodo Payments...");
        const response = await fetch("https://live.dodopayments.com/checkouts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                product_cart: [
                    { product_id: productId, quantity: 1 }
                ],
                customer: {
                    email,
                    name
                },
                metadata: {
                    plan_type: plan,  // For webhook handler
                    email: email      // For user identification
                },
                return_url: process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}/payment-success`
                    : "http://localhost:3000/payment-success"
            })
        });

        console.log(`Dodo Response Status: ${response.status} ${response.statusText}`);

        const responseText = await response.text();
        console.log("Dodo Raw Response:", responseText);

        let responseData;
        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            console.error("Failed to parse Dodo response as JSON");
            throw new Error(`Invalid response from Dodo: ${responseText.slice(0, 100)}...`);
        }

        if (!response.ok) {
            throw new Error(responseData.message || responseData.error || `Payment API Error: ${response.statusText}`);
        }

        res.status(200).json({
            checkoutUrl: responseData.checkout_url
        });
    } catch (error) {
        console.error('Checkout creation error:', error);
        res.status(500).json({ error: error.message });
    }
}
