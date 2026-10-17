import { Star } from "lucide-react";

export function Stars({ className = "size-4", label = "5 stelle su 5" }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-star" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${className} fill-current`} aria-hidden="true" />
      ))}
    </span>
  );
}
