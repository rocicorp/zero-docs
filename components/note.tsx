import { cn } from "@/lib/utils";
import clsx from "clsx";
import { PropsWithChildren } from "react";

type NoteProps = PropsWithChildren & {
  type?: "note" | "danger" | "warning";
  emoji?: string; // Optional emoji override
};

export default function Note({ children, type = "note", emoji }: NoteProps) {
  const noteClassNames = clsx({
    "bg-gray-900 border-gray-800": type === "note",
    "bg-yellow-950 border-yellow-900": type === "warning",
    "bg-red-100 border-red-200": type === "danger",
  });

  // Default emojis by note type
  const typeEmojis: Record<"note" | "warning" | "danger", string> = {
    note: "🤔",
    warning: "😬",
    danger: "😱",
  };

  // Use the overridden emoji if provided; otherwise, use the default
  const displayedEmoji = emoji || typeEmojis[type];

  return (
    <div
      className={cn(
        "note-container border rounded-md p-3.5 text-sm tracking-wide flex items-start",
        noteClassNames
      )}
    >
      <span className="note-emoji">{displayedEmoji}</span>
      <aside className="note-aside">{children}</aside>
    </div>
  );
}
