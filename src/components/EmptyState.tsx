import Link from "next/link";

type Props = {
  icon?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  icon = "🛒",
  title,
  description,
  actionHref,
  actionLabel,
}: Props) {
  return (
    <div className="card mt-8 flex flex-col items-center px-6 py-12 text-center">
      <div className="text-4xl" aria-hidden>
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-bold text-stone-900">{title}</h2>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-stone-600">{description}</p>
      )}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
