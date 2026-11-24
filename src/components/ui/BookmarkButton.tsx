"use client";

import { Bookmark } from "lucide-react";
import { toggleBookmark, useBookmarks } from "@/lib/storage";
import { sfx } from "@/lib/audio";

export default function BookmarkButton({ id, label = false, className = "" }: { id: string; label?: boolean; className?: string }) {
  const marks = useBookmarks();
  const on = marks.includes(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        sfx("click");
        toggleBookmark(id);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove from My List" : "Add to My List"}
      title={on ? "Remove from My List" : "Add to My List"}
      className={`${label ? "btn-ghost" : "glass grid h-9 w-9 place-items-center rounded-full"} ${on ? "text-[#f5c46b]" : "text-white/80"} ${className}`}
    >
      <Bookmark size={16} fill={on ? "currentColor" : "none"} />
      {label && <span>{on ? "In My List" : "My List"}</span>}
    </button>
  );
}
