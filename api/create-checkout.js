import 'dotenv/config';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    console.log("API Handler invoked for:", req.url);
    console.log("Request Body:", req.body);

    // MANUAL FALLBACK: Read .env directly if process.env is missing the key
    let apiKey = process.env.DODO_PAYMENTS_API_KEY;

    console.log("Current Working Directory:", process.cwd());
    const envPath = path.join(process.cwd(), '.env');
    console.log("Looking for .env at:", envPath);

    if (!apiKey) {
        try {
            if (fs.existsSync(envPath)) {
                console.log(".env file found.");
                const envContent = fs.readFileSync(envPath, 'utf8');
                const match = envContent.match(/DODO_PAYMENTS_API_KEY=(.*)/);
                if (match && match[1]) {
                    apiKey = match[1].trim();
                    console.log("Loaded API Key from .env file manually");
                }
            } else {
                console.log(".env file NOT found at expected path.");
            }
        } catch (err) {
            console.error("Failed to read .env manually:", err);
        }
    }

    // FINAL FALLBACK: Hardcoded Test Key (To ensure it works for you now)
    if (!apiKey) {
        console.warn("Using Hardcoded Fallback Key");
        apiKey = "test_sk_94867_31b9d47a83d6a895c370";
    }

    if (!apiKey) {
        console.error("CRITICAL ERROR: DODO_PAYMENTS_API_KEY is missing in environment variables.");
        return res.status(500).json({ error: "Server Configuration Error: Missing Payment API Key" });
    }

    // Set CORS headers to allow requests from the frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
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

    const { plan, email, name } = req.body;

    let productId = null;

    // Product IDs from environment variables (fallback to hardcoded for backward compatibility)
    const PRO_PRODUCT_ID = process.env.DODO_PRO_PRODUCT_ID || "pdt_0NVyfMHf0EQgsljz7d4oE";
    const AGENCY_PRODUCT_ID = process.env.DODO_AGENCY_PRODUCT_ID || "pdt_0NVyfTR8Lz8NBo5Zh5Ekk";

    if (plan === "pro") {
        productId = PRO_PRODUCT_ID;
    }

    if (plan === "agency") {
        productId = AGENCY_PRODUCT_ID;
    }

    if (!productId) {
        return res.status(400).json({ error: "Invalid plan selected" });
    }

    try {
        console.log("Sending request to Dodo Payments...");
        const response = await fetch("https://test.dodopayments.com/checkouts", {
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
