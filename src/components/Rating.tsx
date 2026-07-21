"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  rating: number;
  reviews?: number;
  size?: "sm" | "default";
  color?: "gold" | "primary" | "muted";
}

export function Rating({ rating, reviews, size = "default", color = "primary" }: RatingProps) {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  
  const filledColor = color === "gold" ? "text-gold fill-gold" : color === "muted" ? "text-muted fill-muted" : "text-primary fill-primary";
  const emptyColor = color === "gold" ? "text-gold/30 fill-transparent" : color === "muted" ? "text-muted fill-transparent" : "text-muted fill-transparent";
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(sizeClass, i < Math.floor(rating) ? filledColor : emptyColor)}
          />
        ))}
      </div>
      {reviews !== undefined && (
        <span className="text-sm text-muted-foreground">({reviews} reviews)</span>
      )}
    </div>
  );
}
