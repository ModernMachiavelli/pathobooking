// src/lib/server-auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}
