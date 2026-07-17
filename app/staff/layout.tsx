import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaff } from "@/lib/staff/guard";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/staff", label: "Users" },
  { href: "/staff/promos", label: "Promos" },
  { href: "/staff/team", label: "Team" },
  { href: "/staff/audit", label: "Audit" },
];

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  if (!staff) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Staff</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Internal tools — every action is logged.
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {staff.role}
        </span>
      </div>
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
