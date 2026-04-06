"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

interface BlogPayload {
  title_fr: string;
  title_en: string;
  slug: string;
  content_fr: string;
  content_en: string;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
}

export async function saveBlogPost(payload: BlogPayload, postId?: string) {
  const supabase = createAdminClient();

  if (postId) {
    const { error } = await supabase.from("blog_posts").update(payload).eq("id", postId);
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null };
  } else {
    const { data, error } = await supabase.from("blog_posts").insert(payload).select().single();
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { error: null, id: data.id };
  }
}
