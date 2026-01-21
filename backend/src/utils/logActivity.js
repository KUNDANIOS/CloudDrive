import { supabase } from "../supabase.js";

export async function logActivity({
  userId,
  action,
  resourceType,
  resourceId,
  metadata = {},
}) {
  await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
  });
}
