"use client";

import { UserButton } from "@clerk/nextjs";

export function UserMenu() {
  return (
    <div className="flex items-center justify-end shrink-0">
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-9 w-9",
          },
        }}
      />
    </div>
  );
}
