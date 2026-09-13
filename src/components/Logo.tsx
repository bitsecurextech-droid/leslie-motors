import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Props = { className?: string };

export function Logo({ className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary p-[2px]",
        className,
      )}
    >
      <span className="flex size-full items-center justify-center rounded-full bg-foreground p-[2px]">
        <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-background">
          <img
            src="/leslie-logo.png"
            alt={`${siteConfig.name} logo`}
            className="size-full rounded-full object-cover"
          />
        </span>
      </span>
    </span>
  );
}