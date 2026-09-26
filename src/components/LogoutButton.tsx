"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";

export function LogoutButton() {
  const router = useRouter();
  const t = useT();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={logout} className="btn-secondary !px-3 !py-1.5">
      {t("nav.logout")}
    </button>
  );
}
