import { cn } from "@/lib/utils";
import clsx from "clsx";
import { PropsWithChildren } from "react";

type NoteProps = PropsWithChildren & {
  type?: "note" | "danger" | "warning" | "success";
};

export default function Note({ children, type = "note" }: NoteProps) {
  const noteClassNames = clsx({
    "dark:bg-neutral-900 bg-neutral-100": type == "note",
    "dark:bg-red-950 bg-red-100 border-red-200 dark:border-red-900":
      type === "danger",
    "dark:bg-orange-950 bg-orange-100 border-orange-200 dark:border-orange-900":
      type === "warning",
    "dark:bg-green-950 bg-green-100 border-green-200 dark:border-green-900":
      type === "success",
  });

  return (
    <div
      className={cn(
        "border rounded-md py-0.5 px-3.5 text-sm tracking-wide",
        noteClassNames
      )}
    >
      {children}
    </div>
  );
}
