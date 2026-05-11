"use client";

import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  reviews?: number;
  size?: "sm" | "default";
}

export function Rating({ rating, reviews, size = "default" }: RatingProps) {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${i < Math.floor(rating) ? "text-primary fill-primary" : "text-muted fill-muted"}`}
          />
        ))}
      </div>
      {reviews !== undefined && (
        <span className="text-sm text-muted-foreground">({reviews} reviews)</span>
      )}
    </div>
  );
}
