import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    // Now we can get the session or user object
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError) {
      throw userError
    }

    const { password } = await req.json();
  
    const { data: isValidOldPassword, error: passwordError } = await supabaseClient.rpc("verify_user_password", { password });
    
    if (passwordError || !isValidOldPassword) {
      return new Response(
        JSON.stringify({ error: "Invalid password" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    if (user.user_metadata.user_type === 'lady') {
      const { error } = await supabaseClient
        .from('ladies')
        .delete()
        .eq('id', user.id)

      if (error) {
          throw error
      }
    } else {
      const { error } = await supabaseClient
        .from('establishments')
        .delete()
        .eq('id', user.id)

      if (error) {
          throw error
      }
    }
    // Create the admin client to user with the Admin API.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: deletion_data, error: deletion_error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deletion_error) {
      throw deletion_error
    }

    return new Response("User deleted: " + JSON.stringify(deletion_data, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
