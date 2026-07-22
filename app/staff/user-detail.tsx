"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import {
  searchUsers,
  getUserDetail,
  grantTier,
  revokeGrant,
  type StaffUserRow,
  type StaffUserDetail,
} from "./actions";
import { panelClass, microLabelClass, PanelTitle, FeedbackMessage, EmptyState, TierBadge } from "./ui";

type Tier = "liner" | "shader" | "magnum";
type Feedback = { text: string; ok: boolean } | null;

interface GrantDraft {
  tier: Tier;
  expiresAt: string;
  note: string;
}

const EMPTY_DRAFT: GrantDraft = { tier: "shader", expiresAt: "", note: "" };

const TIER_OPTIONS = [
  { value: "liner", label: "Liner" },
  { value: "shader", label: "Shader" },
  { value: "magnum", label: "Magnum" },
];

const EMAIL_RE = /\S+@\S+\.\S+/;

// Mirrors the server-side zod rule so the button disables instead of round-tripping an error.
const noteValid = (d: GrantDraft) => d.note.trim().length >= 3;

const toIso = (date: string) => (date ? new Date(date).toISOString() : undefined);

export function StaffUsersPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StaffUserRow[]>([]);
  const [listMessage, setListMessage] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();
  const searchSeq = useRef(0);
  const detailSeq = useRef(0);

  // Manage-account slide-over
  const [selected, setSelected] = useState<StaffUserRow | null>(null);
  const [detail, setDetail] = useState<StaffUserDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMessage, setDetailMessage] = useState<Feedback>(null);
  const [grantFormOpen, setGrantFormOpen] = useState(false);
  const [draft, setDraft] = useState<GrantDraft>(EMPTY_DRAFT);

  // Grant-by-email slide-over
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailAddr, setEmailAddr] = useState("");
  const [emailDraft, setEmailDraft] = useState<GrantDraft>(EMPTY_DRAFT);
  const [emailMessage, setEmailMessage] = useState<Feedback>(null);

  const runSearch = useCallback((q: string) => {
    const seq = ++searchSeq.current;
    startTransition(async () => {
      const res = await searchUsers(q);
      if (searchSeq.current !== seq) return;
      setResults(res.users);
      if (res.error) setListMessage({ text: res.error, ok: false });
    });
  }, []);

  // Live search with a short debounce; empty query browses newest accounts.
  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), query ? 250 : 0);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const reloadDetail = useCallback((userId: string) => {
    const seq = ++detailSeq.current;
    startTransition(async () => {
      const res = await getUserDetail(userId);
      if (detailSeq.current !== seq) return;
      if (res.ok && res.user) setDetail(res.user);
      else setDetailMessage({ text: res.error ?? "Failed to load account", ok: false });
    });
  }, []);

  // Panel opens instantly with the row's data; full detail streams in behind it.
  const openUser = (row: StaffUserRow) => {
    setSelected(row);
    setDetail(null);
    setDetailMessage(null);
    setGrantFormOpen(false);
    setDraft(EMPTY_DRAFT);
    setDetailOpen(true);
    reloadDetail(row.id);
  };

  const openEmailGrant = (prefill = "") => {
    setEmailAddr(prefill);
    setEmailDraft(EMPTY_DRAFT);
    setEmailMessage(null);
    setEmailOpen(true);
  };

  const submitDetailGrant = () => {
    if (!selected) return;
    startTransition(async () => {
      const res = await grantTier({
        userId: selected.id,
        tier: draft.tier,
        expiresAt: toIso(draft.expiresAt),
        note: draft.note,
      });
      if (res.ok) {
        setDetailMessage({ text: `Granted ${draft.tier}`, ok: true });
        setGrantFormOpen(false);
        setDraft(EMPTY_DRAFT);
        reloadDetail(selected.id);
        runSearch(query); // keep list badges current
      } else {
        setDetailMessage({ text: res.error ?? "Grant failed", ok: false });
      }
    });
  };

  const doRevoke = (grantId: string) => {
    if (!selected) return;
    startTransition(async () => {
      const res = await revokeGrant(grantId);
      setDetailMessage(res.ok ? { text: "Revoked", ok: true } : { text: res.error ?? "Revoke failed", ok: false });
      if (res.ok) {
        reloadDetail(selected.id);
        runSearch(query);
      }
    });
  };

  const submitEmailGrant = () => {
    const email = emailAddr.trim();
    startTransition(async () => {
      const res = await grantTier({
        email,
        tier: emailDraft.tier,
        expiresAt: toIso(emailDraft.expiresAt),
        note: emailDraft.note,
      });
      if (res.ok) {
        setEmailMessage({ text: `Granted ${emailDraft.tier} to ${email}`, ok: true });
        setEmailAddr("");
        setEmailDraft(EMPTY_DRAFT);
        runSearch(query); // the email may belong to an existing account
      } else {
        setEmailMessage({ text: res.error ?? "Grant failed", ok: false });
      }
    });
  };

  const emailLike = EMAIL_RE.test(query.trim());
  const view = detail ?? selected;

  return (
    <section className={cn(panelClass, "p-5")}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink-black/80 dark:text-ink-cream/80">Accounts</h2>
          <p className="mt-0.5 text-[11px] text-ink-black/35 dark:text-ink-cream/35">
            Newest first — type to filter by name or email.
          </p>
        </div>
        <Button variant="ink-outline" size="sm" onClick={() => openEmailGrant()}>
          Grant by email
        </Button>
      </div>

      <Input
        label="Search"
        placeholder="Name or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <ul className="mt-3 divide-y divide-ink-black/[0.04] dark:divide-ink-cream/[0.05]">
        {results.map((u) => {
          const isOpen = detailOpen && selected?.id === u.id;
          return (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => openUser(u)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                className={cn(
                  "group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer",
                  isOpen
                    ? "bg-ink-black/[0.05] dark:bg-ink-cream/[0.07]"
                    : "hover:bg-ink-black/[0.025] dark:hover:bg-ink-cream/[0.04]"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-black/80 dark:text-ink-cream/85">
                    {u.name ?? u.email}
                  </span>
                  <span className="block truncate text-[11px] text-ink-black/35 dark:text-ink-cream/35">
                    {u.email} · {u.role}
                  </span>
                </span>
                {u.createdAt ? (
                  <span
                    className="hidden font-mono text-[9px] tracking-[0.1em] uppercase text-ink-black/25 dark:text-ink-cream/25 sm:block"
                    title={new Date(u.createdAt).toLocaleString()}
                  >
                    {new Date(u.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                ) : null}
                <TierBadge tier={u.tier} comp={u.tierSource === "grant"} />
                <span
                  aria-hidden="true"
                  className="text-ink-black/20 transition-colors group-hover:text-ink-black/45 dark:text-ink-cream/20 dark:group-hover:text-ink-cream/45"
                >
                  ›
                </span>
              </button>
            </li>
          );
        })}
        {!results.length ? (
          <li>
            <EmptyState text={pending ? "Loading…" : query ? "No accounts match" : "No accounts yet"}>
              {emailLike && !pending ? (
                <Button variant="ink-outline" size="sm" onClick={() => openEmailGrant(query.trim())}>
                  Grant a tier to {query.trim()}
                </Button>
              ) : null}
            </EmptyState>
          </li>
        ) : null}
      </ul>
      <FeedbackMessage message={listMessage} />

      {/* ── Manage account ── */}
      <SlideOverPanel open={detailOpen} onClose={() => setDetailOpen(false)} title="Manage account">
        {view ? (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-[15px] font-semibold text-ink-black/80 dark:text-ink-cream/80">
                  {view.name ?? view.email}
                </h2>
                <p className="truncate text-[11px] text-ink-black/35 dark:text-ink-cream/35">
                  {view.email} · {view.role}
                  {view.createdAt ? ` · joined ${new Date(view.createdAt).toLocaleDateString()}` : ""}
                </p>
              </div>
              <TierBadge tier={view.tier} comp={view.tierSource === "grant"} />
            </div>

            {!detail ? (
              <p className="mt-6 font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 dark:text-ink-cream/25">
                Loading details…
              </p>
            ) : (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div className={cn(panelClass, "px-4 py-3")}>
                    <dt className={microLabelClass}>Tier</dt>
                    <dd className="mt-1 text-sm font-medium text-ink-black/80 dark:text-ink-cream/85">
                      {detail.tier ?? "free"}
                      {detail.tierSource ? ` · ${detail.tierSource}` : ""}
                    </dd>
                  </div>
                  <div className={cn(panelClass, "px-4 py-3")}>
                    <dt className={microLabelClass}>Billing</dt>
                    <dd className="mt-1 text-sm font-medium text-ink-black/80 dark:text-ink-cream/85">
                      {detail.billingStatus}
                      {detail.subStatus ? ` / ${detail.subStatus}` : ""}
                    </dd>
                  </div>
                </dl>
                {detail.stripeCustomerId ? (
                  <a
                    className="mt-3 inline-block font-mono text-[10px] tracking-[0.15em] uppercase text-ink-rust hover:text-ink-rust/70 dark:text-ink-red dark:hover:text-ink-red/70"
                    href={`https://dashboard.stripe.com/customers/${detail.stripeCustomerId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Stripe ↗
                  </a>
                ) : null}

                <div className="mt-6 border-t border-ink-black/[0.06] pt-5 dark:border-ink-cream/[0.06]">
                  {!grantFormOpen ? (
                    <Button variant="ink" size="sm" className="w-full" onClick={() => setGrantFormOpen(true)}>
                      Grant a tier
                    </Button>
                  ) : (
                    <>
                      <PanelTitle
                        title="Grant a tier"
                        hint="Overrides billing until it expires or is revoked."
                      />
                      <GrantFields draft={draft} setDraft={setDraft} />
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="ink-outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setGrantFormOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="ink"
                          size="sm"
                          className="flex-1"
                          onClick={submitDetailGrant}
                          disabled={pending || !noteValid(draft)}
                        >
                          Grant {draft.tier}
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 border-t border-ink-black/[0.06] pt-5 dark:border-ink-cream/[0.06]">
                  <PanelTitle title="Grant history" />
                  <ul className="space-y-2">
                    {detail.grants.map((g) => (
                      <li
                        key={g.id}
                        className={cn(panelClass, "flex items-center justify-between gap-3 px-4 py-3")}
                      >
                        <span className="min-w-0 text-[12px] text-ink-black/55 dark:text-ink-cream/55">
                          <TierBadge tier={g.tier} />
                          <span className="ml-2">{g.note}</span>
                          <span className="block font-mono text-[9px] tracking-[0.1em] uppercase text-ink-black/30 dark:text-ink-cream/30">
                            {g.expiresAt ? `until ${new Date(g.expiresAt).toLocaleDateString()}` : "forever"}
                            {g.revokedAt ? " · revoked" : ""}
                          </span>
                        </span>
                        {!g.revokedAt ? (
                          <Button
                            variant="ink-outline"
                            size="sm"
                            onClick={() => doRevoke(g.id)}
                            disabled={pending}
                          >
                            Revoke
                          </Button>
                        ) : null}
                      </li>
                    ))}
                    {!detail.grants.length ? (
                      <li className="text-[11px] text-ink-black/30 dark:text-ink-cream/30">No grants.</li>
                    ) : null}
                  </ul>
                </div>
              </>
            )}
            <FeedbackMessage message={detailMessage} />
          </div>
        ) : null}
      </SlideOverPanel>

      {/* ── Grant by email ── */}
      <SlideOverPanel open={emailOpen} onClose={() => setEmailOpen(false)} title="Grant by email">
        <PanelTitle
          title="Pre-signup grant"
          hint="For someone without an account yet — the tier attaches automatically when they register with this email."
        />
        <div className="space-y-2">
          <Input
            label="Email"
            type="email"
            placeholder="person@example.com"
            value={emailAddr}
            onChange={(e) => setEmailAddr(e.target.value)}
          />
          <GrantFields draft={emailDraft} setDraft={setEmailDraft} />
        </div>
        <Button
          variant="ink"
          size="sm"
          className="mt-3 w-full"
          onClick={submitEmailGrant}
          disabled={pending || !EMAIL_RE.test(emailAddr.trim()) || !noteValid(emailDraft)}
        >
          Grant {emailDraft.tier}
        </Button>
        <FeedbackMessage message={emailMessage} />
      </SlideOverPanel>
    </section>
  );
}

function GrantFields({
  draft,
  setDraft,
}: {
  draft: GrantDraft;
  setDraft: (d: GrantDraft) => void;
}) {
  return (
    <div className="space-y-2">
      <Select
        label="Tier"
        options={TIER_OPTIONS}
        value={draft.tier}
        onChange={(e) => setDraft({ ...draft, tier: e.target.value as Tier })}
      />
      <Input
        label="Expires (empty = forever)"
        type="date"
        value={draft.expiresAt}
        onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })}
      />
      <Input
        label="Note (required, goes in the audit log)"
        placeholder="Why?"
        value={draft.note}
        onChange={(e) => setDraft({ ...draft, note: e.target.value })}
      />
    </div>
  );
}
