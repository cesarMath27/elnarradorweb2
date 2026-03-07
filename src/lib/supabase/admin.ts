import { createClient } from "@supabase/supabase-js";

// Use this client strictly on the backend to bypass RLS when performing admin actions
// like uploading files or inserting records.
export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
};
