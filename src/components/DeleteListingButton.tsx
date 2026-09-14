"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteListingButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Энэ зарыг устгах уу?")) return;
    setLoading(true);
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
    >
      Устгах
    </button>
  );
}
