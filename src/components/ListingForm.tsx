"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_KEYS, STATUSES, UB_DISTRICTS } from "@/lib/constants";

export type ListingFormData = {
  id?: string;
  title: string;
  category: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  unit: string;
  expiryDate: string;
  pickupDistrict: string;
  photoUrl: string;
  status: string;
};

export function ListingForm({
  initial,
  mode,
}: {
  initial?: Partial<ListingFormData>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 1);
  const expiryStr =
    initial?.expiryDate || defaultExpiry.toISOString().slice(0, 10);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title")),
      category: String(fd.get("category")),
      description: String(fd.get("description")),
      originalPrice: Number(fd.get("originalPrice")),
      discountPrice: Number(fd.get("discountPrice")),
      quantity: Number(fd.get("quantity")),
      unit: String(fd.get("unit")),
      expiryDate: String(fd.get("expiryDate")),
      pickupDistrict: String(fd.get("pickupDistrict")),
      photoUrl: String(fd.get("photoUrl") || "") || null,
      status: String(fd.get("status")),
    };

    const url =
      mode === "create" ? "/api/listings" : `/api/listings/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Алдаа гарлаа");
      return;
    }
    router.push("/seller/listings");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="title">
          Гарчиг
        </label>
        <input
          id="title"
          name="title"
          required
          className="input"
          defaultValue={initial?.title || ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">
            Ангилал
          </label>
          <select
            id="category"
            name="category"
            className="input"
            defaultValue={initial?.category || "FOOD"}
          >
            {CATEGORY_KEYS.map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">
            Төлөв
          </label>
          <select
            id="status"
            name="status"
            className="input"
            defaultValue={initial?.status || "ACTIVE"}
          >
            {(Object.keys(STATUSES) as (keyof typeof STATUSES)[]).map((k) => (
              <option key={k} value={k}>
                {STATUSES[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">
          Тайлбар
        </label>
        <textarea
          id="description"
          name="description"
          required
          className="input min-h-[100px]"
          defaultValue={initial?.description || ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="originalPrice">
            Анхны үнэ (₮)
          </label>
          <input
            id="originalPrice"
            name="originalPrice"
            type="number"
            min={1}
            required
            className="input"
            defaultValue={initial?.originalPrice ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="discountPrice">
            Хямдралтай үнэ (₮)
          </label>
          <input
            id="discountPrice"
            name="discountPrice"
            type="number"
            min={0}
            required
            className="input"
            defaultValue={initial?.discountPrice ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="quantity">
            Тоо хэмжээ
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            required
            className="input"
            defaultValue={initial?.quantity ?? 1}
          />
        </div>
        <div>
          <label className="label" htmlFor="unit">
            Нэгж
          </label>
          <input
            id="unit"
            name="unit"
            required
            className="input"
            placeholder="ширхэг, кг, порц..."
            defaultValue={initial?.unit || "ширхэг"}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="expiryDate">
            Дуусах огноо
          </label>
          <input
            id="expiryDate"
            name="expiryDate"
            type="date"
            required
            className="input"
            defaultValue={expiryStr}
          />
        </div>
        <div>
          <label className="label" htmlFor="pickupDistrict">
            Авах дүүрэг (УБ)
          </label>
          <select
            id="pickupDistrict"
            name="pickupDistrict"
            className="input"
            defaultValue={initial?.pickupDistrict || "Сүхбаатар"}
          >
            {UB_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="photoUrl">
          Зургийн URL (заавал биш)
        </label>
        <input
          id="photoUrl"
          name="photoUrl"
          type="url"
          className="input"
          placeholder="https://..."
          defaultValue={initial?.photoUrl || ""}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? "Хадгалж байна..."
            : mode === "create"
              ? "Зар үүсгэх"
              : "Хадгалах"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.back()}
        >
          Буцах
        </button>
      </div>
    </form>
  );
}
