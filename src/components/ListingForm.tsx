"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  CATEGORY_KEYS,
  STATUSES,
  UB_DISTRICTS,
  toLocalInputValue,
} from "@/lib/constants";

export type ListingFormData = {
  id?: string;
  title: string;
  category: string;
  description: string;
  bagPrice: number;
  estimatedRetailValue: number;
  quantityAvailable: number;
  pickupStart: string;
  pickupEnd: string;
  pickupDistrict: string;
  pickupAddress: string;
  dietaryNotes: string;
  photoUrl: string;
  status: string;
};

function defaultWindow() {
  const start = new Date();
  start.setHours(18, 0, 0, 0);
  if (start.getTime() < Date.now()) {
    start.setDate(start.getDate() + 1);
  }
  const end = new Date(start);
  end.setHours(start.getHours() + 2);
  return {
    pickupStart: toLocalInputValue(start),
    pickupEnd: toLocalInputValue(end),
  };
}

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
  const defaults = defaultWindow();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title")),
      category: String(fd.get("category")),
      description: String(fd.get("description")),
      bagPrice: Number(fd.get("bagPrice")),
      estimatedRetailValue: Number(fd.get("estimatedRetailValue")),
      quantityAvailable: Number(fd.get("quantityAvailable")),
      pickupStart: String(fd.get("pickupStart")),
      pickupEnd: String(fd.get("pickupEnd")),
      pickupDistrict: String(fd.get("pickupDistrict")),
      pickupAddress: String(fd.get("pickupAddress") || "") || null,
      dietaryNotes: String(fd.get("dietaryNotes") || "") || null,
      photoUrl: String(fd.get("photoUrl") || "") || null,
      status: String(fd.get("status")),
    };

    const url =
      mode === "create" ? "/api/listings" : `/api/listings/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Азтай уут хадгалахад алдаа гарлаа");
        return;
      }
      router.push("/seller/listings");
      router.refresh();
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <p className="rounded-xl border border-green-200 bg-green-50/70 px-3 py-2 text-xs leading-relaxed text-green-900">
        <strong>Азтай уут</strong> — ангилал тодорхой, яг агуулга нь
        нууц/өөрчлөгдөнө. Худалдан авагч авах цонхны хугацаанд ирнэ.
      </p>

      <div>
        <label className="label" htmlFor="title">
          Гарчиг
        </label>
        <input
          id="title"
          name="title"
          required
          className="input"
          placeholder="Жишээ: Талх, нарийн боовны Азтай уут"
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
            defaultValue={initial?.category || "BAKERY"}
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
          placeholder="Агуулга өдөр бүр өөрчлөгдөнө — Азтай уут..."
          defaultValue={initial?.description || ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="bagPrice">
            Азтай уутны үнэ (₮)
          </label>
          <input
            id="bagPrice"
            name="bagPrice"
            type="number"
            min={0}
            required
            className="input"
            defaultValue={initial?.bagPrice ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="estimatedRetailValue">
            Ойролцоо жижиглэн үнэ (₮)
          </label>
          <input
            id="estimatedRetailValue"
            name="estimatedRetailValue"
            type="number"
            min={1}
            required
            className="input"
            defaultValue={initial?.estimatedRetailValue ?? ""}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="quantityAvailable">
          Үлдсэн уутны тоо
        </label>
        <input
          id="quantityAvailable"
          name="quantityAvailable"
          type="number"
          min={0}
          required
          className="input"
          defaultValue={initial?.quantityAvailable ?? 1}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="pickupStart">
            Авах цонх — эхлэх
          </label>
          <input
            id="pickupStart"
            name="pickupStart"
            type="datetime-local"
            required
            className="input"
            defaultValue={initial?.pickupStart || defaults.pickupStart}
          />
        </div>
        <div>
          <label className="label" htmlFor="pickupEnd">
            Авах цонх — дуусах
          </label>
          <input
            id="pickupEnd"
            name="pickupEnd"
            type="datetime-local"
            required
            className="input"
            defaultValue={initial?.pickupEnd || defaults.pickupEnd}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="pickupDistrict">
            Дүүрэг (УБ)
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
        <div>
          <label className="label" htmlFor="pickupAddress">
            Хаяг (заавал биш)
          </label>
          <input
            id="pickupAddress"
            name="pickupAddress"
            className="input"
            placeholder="Гудамж, орц..."
            defaultValue={initial?.pickupAddress || ""}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="dietaryNotes">
          Хоолны тэмдэглэл (харшил гэх мэт)
        </label>
        <input
          id="dietaryNotes"
          name="dietaryNotes"
          className="input"
          placeholder="Глютен, самар..."
          defaultValue={initial?.dietaryNotes || ""}
        />
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
              ? "Азтай уут үүсгэх"
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
