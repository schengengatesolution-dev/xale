import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatDate, ROLES } from "@/lib/constants";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const total = users.length;
  const sellers = users.filter((u) => u.role === "SELLER").length;
  const buyers = users.filter((u) => u.role === "BUYER").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Админ самбар</h1>
          <p className="text-sm text-stone-600">
            Бүртгэлтэй хэрэглэгчид ·{" "}
            <span className="font-medium text-stone-800">{admin.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-secondary !px-3 !py-1.5">
            Нүүр
          </Link>
          <AdminLogoutButton />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Нийт
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{total}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Худалдагч
          </p>
          <p className="mt-2 text-3xl font-bold text-green-700">{sellers}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Худалдан авагч
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{buyers}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold">Хэрэглэгчид</h2>
        <p className="text-xs text-stone-500">Шинэ эхэнд · нууц үг харагдахгүй</p>

        {users.length === 0 ? (
          <div className="card mt-4 text-center text-stone-500">
            Одоогоор бүртгэлтэй хэрэглэгч байхгүй.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-stone-200 bg-white md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Нэр</th>
                    <th className="px-4 py-3 font-semibold">Имэйл</th>
                    <th className="px-4 py-3 font-semibold">Утас</th>
                    <th className="px-4 py-3 font-semibold">WhatsApp</th>
                    <th className="px-4 py-3 font-semibold">Төрөл</th>
                    <th className="px-4 py-3 font-semibold">Бүртгүүлсэн</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-50/80">
                      <td className="px-4 py-3 font-medium text-stone-900">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-stone-700">{u.email}</td>
                      <td className="px-4 py-3 text-stone-600">
                        {u.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {u.whatsapp || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            u.role === "SELLER"
                              ? "rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-800"
                              : "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800"
                          }
                        >
                          {ROLES[u.role as keyof typeof ROLES] || u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="mt-4 space-y-3 md:hidden">
              {users.map((u) => (
                <li key={u.id} className="card space-y-2 !p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-stone-900">{u.name}</p>
                      <p className="text-sm text-stone-600">{u.email}</p>
                    </div>
                    <span
                      className={
                        u.role === "SELLER"
                          ? "shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-800"
                          : "shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800"
                      }
                    >
                      {ROLES[u.role as keyof typeof ROLES] || u.role}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-stone-600">
                    <div>
                      <dt className="text-stone-400">Утас</dt>
                      <dd>{u.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-stone-400">WhatsApp</dt>
                      <dd>{u.whatsapp || "—"}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-stone-400">Бүртгүүлсэн</dt>
                      <dd>{formatDate(u.createdAt)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
