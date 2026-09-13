import { toVideoEmbed } from "@/lib/media";

export function VideoPreview({ url, className = "" }: { url: string | null; className?: string }) {
  const embed = toVideoEmbed(url ?? "");
  if (!embed) return null;

  return (
    <div className={`mt-3 aspect-video w-full overflow-hidden rounded-md border border-border ${className}`}>
      {embed.kind === "iframe" ? (
        <iframe
          src={embed.src}
          title="Vehicle video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <video src={embed.src} controls playsInline className="h-full w-full object-cover" />
      )}
    </div>
  );
}
