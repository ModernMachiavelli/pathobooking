"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

type NavItem = {
  href: string;
  label: string;
};

export default function MainNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [doctorSlug, setDoctorSlug] = useState<string | null>(null);
  const [doctorPendingCount, setDoctorPendingCount] = useState<number>(0);

  const role = (session?.user as any)?.role as string | undefined;
  const sessionDoctorSlug = (session?.user as any)?.doctorSlug as
    | string
    | undefined;

  // opcional debug
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
      doctorSlug,
      "pending=",
      doctorPendingCount
    );
  }

  useEffect(() => {
    if (status !== "authenticated") {
      setDoctorSlug(null);
      setDoctorPendingCount(0);
      return;
    }

    if (role !== "DOCTOR") {
      setDoctorSlug(null);
      setDoctorPendingCount(0);
      return;
    }

    let cancelled = false;

    async function loadDoctorMeta() {
      try {
        const res = await fetch("/api/me/doctor");
        if (!res.ok) {
          console.warn("Failed to load doctor data for nav", await res.text());
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        if (data?.slug) {
          setDoctorSlug(data.slug as string);
        } else if (sessionDoctorSlug) {
          setDoctorSlug(sessionDoctorSlug);
        }

        if (typeof data?.pendingCount === "number") {
          setDoctorPendingCount(data.pendingCount);
        } else {
          setDoctorPendingCount(0);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching /api/me/doctor", err);
        }
      }
    }

    // перше завантаження
    loadDoctorMeta();

    // слухач події від інбокса лікаря
    function handleDoctorRequestsChanged() {
      loadDoctorMeta();
    }

    if (typeof window !== "undefined") {
      window.addEventListener(
        "pathobooking:doctorRequestsChanged",
        handleDoctorRequestsChanged
      );
    }

    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "pathobooking:doctorRequestsChanged",
          handleDoctorRequestsChanged
        );
      }
    };
  }, [status, role, sessionDoctorSlug]);

  const items: NavItem[] = [
    { href: "/", label: "Головна" },
    { href: "/doctors", label: "Лікарі" },
  ];

  if (session?.user) {
    items.push(
      { href: "/my/cases", label: "Мої кейси" },
      { href: "/my/requests", label: "Мої запити" }
    );
  }

  if (role === "DOCTOR" && doctorSlug) {
    items.push({
      href: `/doctors/${doctorSlug}/requests`,
      label: "Мій inbox",
    });
  }

  if (role === "ADMIN") {
    items.push({
      href: "/admin",
      label: "Адмін",
    });
  }

  return (
    <nav className="flex flex-col gap-1 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const isInboxLink =
            role === "DOCTOR" &&
            doctorSlug &&
            item.href === `/doctors/${doctorSlug}/requests`;

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
              {isInboxLink && doctorPendingCount > 0 && (
                <Badge
                  variant="default"
                  className="ml-1 text-[10px] px-1.5 py-0"
                >
                  {doctorPendingCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
      {role === "DOCTOR" && (
        <span className="text-[10px] text-slate-400">
          debug: role={role ?? "null"}; doctorSlug=
          {doctorSlug ?? sessionDoctorSlug ?? "null"}; pending=
          {doctorPendingCount}
        </span>
      )}
    </nav>
  );
}
