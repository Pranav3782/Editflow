import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Initialize Supabase client with service role key
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Verify webhook secret for security
        const webhookSecret = req.headers.get('X-Webhook-Secret');
        const expectedSecret = Deno.env.get('DODO_WEBHOOK_SECRET');

        if (expectedSecret && webhookSecret !== expectedSecret) {
            console.error('Unauthorized webhook attempt: Secret mismatch');
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 401
                }
            );
        }

        // Parse webhook payload from Dodo Payments
        const payload = await req.json();
        console.log('Received webhook:', JSON.stringify(payload, null, 2));

        // Handle different webhook events
        const eventType = payload.event || payload.type;

        if (eventType === 'payment.succeeded' || eventType === 'checkout.completed') {
            const {
                customer_email,
                metadata,
                amount,
                checkout_id,
                payment_id,
            } = payload.data || payload;

            // Extract user info from metadata or email
            const userEmail = customer_email || metadata?.email;
            const planType = metadata?.plan_type || 'pro'; // Default to pro if not specified

            if (!userEmail) {
                throw new Error('Customer email not found in webhook payload');
            }

            // Find user by email
            const { data: userData, error: userError } = await supabaseClient
                .from('profiles')
                .select('id')
                .eq('email', userEmail)
                .single();

            if (userError || !userData) {
                console.error('User not found:', userEmail);
                throw new Error(`User not found: ${userEmail}`);
            }

            const userId = userData.id;

            // Insert payment record
            const { error: paymentError } = await supabaseClient
                .from('payments')
                .insert({
                    user_id: userId,
                    payment_id: payment_id || checkout_id || `payment_${Date.now()}`,
                    checkout_id: checkout_id,
                    plan_type: planType,
                    amount: amount ? parseFloat(amount) : (planType === 'agency' ? 79.00 : 29.00),
                    currency: 'USD',
                    status: 'completed',
                });

            if (paymentError) {
                console.error('Error inserting payment:', paymentError);
                throw paymentError;
            }

            // Activate subscription using the function we created
            const { error: activationError } = await supabaseClient.rpc(
                'activate_subscription',
                {
                    p_user_id: userId,
                    p_plan_type: planType,
                    p_subscription_id: payment_id || checkout_id || `sub_${Date.now()}`,
                    p_customer_id: metadata?.customer_id || userEmail,
                }
            );

            if (activationError) {
                console.error('Error activating subscription:', activationError);
                throw activationError;
            }

            console.log(`✅ Subscription activated for user: ${userEmail} (${planType})`);

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Subscription activated successfully',
                    user_id: userId,
                    plan_type: planType,
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                }
            );
        }

        // Handle other event types
        console.log(`Unhandled event type: ${eventType}`);
        return new Response(
            JSON.stringify({ success: true, message: 'Event received but not processed' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
