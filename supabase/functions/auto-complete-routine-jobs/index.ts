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
  completions: string[];
  last_payout_date: string | null;
  category: string;
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
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
    const todayStr = today.toISOString().split('T')[0];

    console.log(`Running auto-completion check for ${todayStr}, day: ${dayOfWeek}`);

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
      let shouldComplete = false;

      // Check if job should be completed today based on frequency
      if (job.frequency === 'daily') {
        shouldComplete = true;
      } else if (job.frequency === 'weekly') {
        // Complete on the first day of the week if days_of_week includes it
        if (job.days_of_week && job.days_of_week.includes(dayOfWeek)) {
          shouldComplete = true;
        }
      } else if (job.frequency === 'custom' && job.days_of_week) {
        // Complete if today is in the custom days
        if (job.days_of_week.includes(dayOfWeek)) {
          shouldComplete = true;
        }
      } else if (job.frequency === 'monthly') {
        // Complete on the 1st of each month
        if (today.getDate() === 1) {
          shouldComplete = true;
        }
      }

      if (shouldComplete) {
        // Get current completions
        const completions = (job.completions || []) as string[];
        
        // Check if already completed today
        if (completions.includes(todayStr)) {
          console.log(`Job ${job.name} already completed today`);
          continue;
        }

        const updatedCompletions = [...completions, todayStr];

        // Calculate required completions for a month
        let requiredCompletions = 0;
        if (job.frequency === 'daily') {
          requiredCompletions = 30;
        } else if (job.frequency === 'weekly') {
          requiredCompletions = 4;
        } else if (job.frequency === 'monthly') {
          requiredCompletions = 1;
        } else if (job.frequency === 'custom' && job.days_of_week) {
          requiredCompletions = job.days_of_week.length * 4;
        }

        console.log(`Job ${job.name}: ${updatedCompletions.length}/${requiredCompletions} completions`);

        // Check if we've reached the monthly threshold
        if (updatedCompletions.length >= requiredCompletions) {
          console.log(`Job ${job.name} reached threshold! Creating financial record`);

          // Create financial record
          const { error: finError } = await supabaseClient
            .from('financial_records')
            .insert({
              user_id: job.user_id,
              type: 'income',
              amount: job.earnings,
              description: `دستمزد ماهانه: ${job.name}`,
              category: job.category,
              date: todayStr,
              routine_job_id: job.id,
            });

          if (finError) {
            console.error(`Error creating financial record for ${job.name}:`, finError);
            throw finError;
          }

          // Reset completions
          const { error: updateError } = await supabaseClient
            .from('routine_jobs')
            .update({
              completions: [],
              last_payout_date: todayStr,
            })
            .eq('id', job.id);

          if (updateError) {
            console.error(`Error resetting completions for ${job.name}:`, updateError);
            throw updateError;
          }

          results.push({
            job: job.name,
            status: 'payout',
            amount: job.earnings,
            completions: requiredCompletions,
          });
        } else {
          // Just update completions
          const { error: updateError } = await supabaseClient
            .from('routine_jobs')
            .update({ completions: updatedCompletions })
            .eq('id', job.id);

          if (updateError) {
            console.error(`Error updating completions for ${job.name}:`, updateError);
            throw updateError;
          }

          results.push({
            job: job.name,
            status: 'completed',
            completions: updatedCompletions.length,
            remaining: requiredCompletions - updatedCompletions.length,
          });
        }
      }
    }

    console.log('Auto-completion results:', results);

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
