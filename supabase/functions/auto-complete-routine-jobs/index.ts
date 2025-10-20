import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoutineJob {
  id: string;
  user_id: string;
  name: string;
  earnings: number;
  frequency: string;
  days_of_week: string[] | null;
  active: boolean;
  category: string;
  payment_day: number | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const dayOfMonth = today.getDate(); // 1-31
    const todayStr = today.toISOString().split('T')[0];

    console.log(`Running payment check for ${todayStr}, day of week: ${dayOfWeek}, day of month: ${dayOfMonth}`);

    // Get all active routine jobs
    const { data: jobs, error: fetchError } = await supabaseClient
      .from('routine_jobs')
      .select('*')
      .eq('active', true);

    if (fetchError) {
      console.error('Error fetching routine jobs:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${jobs?.length || 0} active routine jobs`);

    const results = [];

    for (const job of (jobs as RoutineJob[])) {
      if (!job.payment_day && job.payment_day !== 0) {
        console.log(`Job ${job.name} has no payment day set, skipping`);
        continue;
      }

      let shouldPay = false;

      // Check if today is the payment day based on frequency
      if (job.frequency === 'daily') {
        // Daily jobs pay every day
        shouldPay = true;
      } else if (job.frequency === 'weekly') {
        // Weekly jobs pay on a specific day of the week (0-6)
        shouldPay = dayOfWeek === job.payment_day;
      } else if (job.frequency === 'monthly') {
        // Monthly jobs pay on a specific day of the month (1-31)
        // Handle edge case for months with fewer days
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const effectivePaymentDay = Math.min(job.payment_day, lastDayOfMonth);
        shouldPay = dayOfMonth === effectivePaymentDay;
      }

      if (shouldPay) {
        console.log(`Payment day reached for job ${job.name}! Creating financial record`);

        // Create financial record
        const { error: finError } = await supabaseClient
          .from('financial_records')
          .insert({
            user_id: job.user_id,
            type: 'income',
            amount: job.earnings,
            description: `دستمزد ${job.frequency === 'daily' ? 'روزانه' : job.frequency === 'weekly' ? 'هفتگی' : 'ماهانه'}: ${job.name}`,
            category: job.category,
            date: todayStr,
            routine_job_id: job.id,
          });

        if (finError) {
          console.error(`Error creating financial record for ${job.name}:`, finError);
          throw finError;
        }

        results.push({
          job: job.name,
          status: 'paid',
          amount: job.earnings,
          frequency: job.frequency,
        });
      } else {
        console.log(`Payment day not reached for job ${job.name} (frequency: ${job.frequency}, payment_day: ${job.payment_day})`);
      }
    }

    console.log('Auto-payment results:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-complete-routine-jobs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
