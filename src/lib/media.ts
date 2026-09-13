import { supabase } from "@/integrations/supabase/client";

const BUCKET = "vehicle-photos";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads an image to Cloud storage and returns a long-lived link to it. */
export async function uploadVehiclePhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must be 10MB or smaller");

  const ext = file.name.split(".").pop()?.toLowerCase().slice(0, 5) || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS);
  if (signErr) throw signErr;
  return data.signedUrl;
}

/** Turns a YouTube, Vimeo or direct video link into something embeddable. */
export function toVideoEmbed(url: string): { kind: "iframe" | "video"; src: string } | null {
  const raw = url.trim();
  if (!raw) return null;

  const yt = raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };

  const vimeo = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(raw)) return { kind: "video", src: raw };

  return null;
}
