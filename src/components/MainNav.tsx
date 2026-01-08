// src/components/MainNav.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

type NavItem = {
  href: string;
  label: string;
};

export default function MainNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [doctorSlug, setDoctorSlug] = useState<string | null>(null);

  const role = (session?.user as any)?.role as string | undefined;
  const sessionDoctorSlug = (session?.user as any)?.doctorSlug as
    | string
    | undefined;

  // 🔍 DEBUG — можна прибрати, коли все запрацює
  if (typeof window !== "undefined") {
    console.log(
      "NAV debug:",
      "status=",
      status,
      "role=",
      role,
      "sessionDoctorSlug=",
      sessionDoctorSlug,
      "stateDoctorSlug=",
      doctorSlug
    );
  }

  // Коли сесія готова — підтягуємо doctorSlug, якщо треба
  useEffect(() => {
    if (status !== "authenticated") {
      setDoctorSlug(null);
      return;
    }

    if (role !== "DOCTOR") {
      setDoctorSlug(null);
      return;
    }

    // Якщо slug вже є в сесії (з auth.ts) — використовуємо його
    if (sessionDoctorSlug) {
      setDoctorSlug(sessionDoctorSlug);
      return;
    }

    // Інакше — тягнемо з бекенду
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/me/doctor");
        if (!res.ok) {
          console.warn("Failed to load doctor data for nav", await res.text());
          return;
        }
        const data = await res.json();
        if (!cancelled && data?.slug) {
          setDoctorSlug(data.slug as string);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching /api/me/doctor", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, role, sessionDoctorSlug]);

  // Базові пункти меню для всіх
  const items: NavItem[] = [
    { href: "/", label: "Головна" },
    { href: "/doctors", label: "Лікарі" },
  ];

  // Якщо є акаунт (будь-яка роль) — додаємо пацієнтські розділи
  if (session?.user) {
    items.push(
      { href: "/my/cases", label: "Мої кейси" },
      { href: "/my/requests", label: "Мої запити" }
    );
  }

  // Якщо це лікар і вже знаємо doctorSlug — додаємо посилання на його inbox
  if (role === "DOCTOR" && doctorSlug) {
    items.push({
      href: `/doctors/${doctorSlug}/requests`,
      label: "Мій inbox",
    });
  }

  return (
    <nav className="flex flex-col gap-1 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "inline-flex items-center rounded-md px-3 py-1.5 transition-colors",
                "border text-xs font-medium",
                isActive
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      {/* Можеш прибрати цей debug-блок пізніше */}
      {role === "DOCTOR" && (
        <span className="text-[10px] text-slate-400">
          debug: role={role ?? "null"}; doctorSlug=
          {doctorSlug ?? sessionDoctorSlug ?? "null"}
        </span>
      )}
    </nav>
  );
}