// src/components/UserStatus.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UserStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
        Перевіряємо сесію...
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Link href="/login">
          <Button variant="outline" size="sm">
            Увійти
          </Button>
        </Link>
      </div>
    );
  }

  const role = (session.user as any).role as string | undefined;
  const name = session.user.name || session.user.email;

  const roleLabel =
    role === "ADMIN"
      ? "Адмін"
      : role === "DOCTOR"
      ? "Лікар"
      : "Пацієнт";

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      <span className="truncate max-w-[180px] text-slate-700">
        {name}
      </span>
      <Badge variant="outline">{roleLabel}</Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Вийти
      </Button>
    </div>
  );
}
