"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, formatBDT, initials } from "@/lib/utils";
import { useCart, useToast } from "@/store/providers";
import { Icon } from "@/components/ui/icon";
import { CartLogo } from "@/components/ui/cart-logo";
import { ProgressBar } from "@/components/ui/misc";

type GroupCampaign = {
  slug: string;
  title: string;
  description: string | null;
  productImage: string | null;
  targetMembers: number;
  members: number;
  price: number;
  oldPrice: number;
};

type GroupProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  categoryName: string;
};

const avatarTones = [
  "from-primary to-secondary",
  "from-secondary to-primary",
  "from-tertiary to-primary",
  "from-primary to-tertiary",
];

export function GroupShopping({
  campaigns,
  products,
}: {
  campaigns: GroupCampaign[];
  products: GroupProduct[];
}) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const [title, setTitle] = useState("Team Studio Upgrade");
  const [budget, setBudget] = useState(220000);
  const [members, setMembers] = useState<string[]>(["You", "Rafiq", "Mim"]);
  const [invite, setInvite] = useState("");
  const [selected, setSelected] = useState<string[]>(
    products.slice(0, 3).map((p) => p.id),
  );
  const [campaignState, setCampaignState] = useState(
    campaigns.map((c) => ({ ...c })),
  );

  const chosen = products.filter((p) => selected.includes(p.id));
  const total = chosen.reduce((a, b) => a + b.price, 0);
  const remaining = budget - total;
  const over = total > budget;
  const perMember = members.length ? Math.round(total / members.length) : total;
  const progress = budget > 0 ? (total / budget) * 100 : 0;

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function addMember() {
    const name = invite.trim();
    if (!name) return;
    if (members.some((m) => m.toLowerCase() === name.toLowerCase())) {
      toast("That member is already in the group.", "error");
      return;
    }
    setMembers((prev) => [...prev, name]);
    setInvite("");
    toast(`${name} added to the group`);
  }

  function joinCampaign(slug: string) {
    setCampaignState((prev) =>
      prev.map((c) =>
        c.slug === slug && c.members < c.targetMembers
          ? { ...c, members: c.members + 1 }
          : c,
      ),
    );
    toast("You joined the group buy. Escrow holds your commitment.");
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="mb-6">
        <div className="chip mb-2 bg-secondary/15 text-secondary">
          <Icon name="group" className="text-sm" />
          Shared shopping
        </div>
        <h1 className="font-display text-3xl font-bold text-ink">Group shopping</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Pool budgets, share product lists and unlock tiered pricing together.
          Escrow holds every commitment until the group validates.
        </p>
      </div>

      {/* Campaigns */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {campaignState.map((c) => {
          const pct = (c.members / c.targetMembers) * 100;
          return (
            <div key={c.slug} className="card card-hover overflow-hidden">
              <div className="flex gap-4 p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-canvas">
                  {c.productImage && (
                    <Image src={c.productImage} alt={c.title} fill sizes="96px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-end gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-tertiary">
                      <Icon name="timer" className="text-sm" />
                      Limited
                    </span>
                  </div>
                  <h3 className="mt-1 line-clamp-1 font-display text-sm font-bold text-ink">{c.title}</h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-base font-bold text-ink">{formatBDT(c.price)}</span>
                    <span className="text-xs text-muted line-through">{formatBDT(c.oldPrice)}</span>
                  </div>
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-[10px] text-muted">
                      <span>{c.members} / {c.targetMembers} backers</span>
                      <span>{c.targetMembers - c.members} to unlock</span>
                    </div>
                    <ProgressBar value={pct} tone="secondary" className="h-1.5" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
                <div className="flex -space-x-2">
                  {members.slice(0, 4).map((m, i) => (
                    <span
                      key={m}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-gradient-to-br text-[9px] font-bold text-white",
                        avatarTones[i % avatarTones.length],
                      )}
                    >
                      {initials(m)}
                    </span>
                  ))}
                </div>
                <button onClick={() => joinCampaign(c.slug)} className="btn-neo btn-sm">
                  <Icon name="how_to_reg" className="text-sm" />
                  Join group
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary-soft">
                  <Icon name="edit" className="text-lg" />
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full max-w-xs border-b border-line bg-transparent pb-1 font-display text-lg font-bold text-ink outline-none focus:border-primary"
                  aria-label="Group title"
                />
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast("Invite link copied to clipboard", "info");
                }}
                className="btn btn-secondary btn-sm"
              >
                <Icon name="link" className="text-sm" />
                Copy invite link
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-line bg-canvas p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Members · {members.length}
                </span>
                <span className="text-xs text-muted">Share equally · {formatBDT(perMember)} each</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {members.map((m, i) => (
                  <span key={m} className="flex items-center gap-2 rounded-full bg-surface py-1 pl-1 pr-3 text-xs">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white", avatarTones[i % avatarTones.length])}>
                      {initials(m)}
                    </span>
                    <span className="text-ink">{m}</span>
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={invite}
                  onChange={(e) => setInvite(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMember()}
                  placeholder="Invite by name…"
                  className="input h-9 text-sm"
                />
                <button onClick={addMember} className="btn-neo btn-sm shrink-0">
                  <Icon name="person_add" className="text-sm" />
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink">Shared product list</h2>
              <span className="text-xs text-muted">{selected.length} selected</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {products.map((p) => {
                const active = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all",
                      active ? "border-primary/40 bg-primary/5" : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                      <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-xs font-semibold text-ink">{p.name}</div>
                      <div className="text-[10px] text-muted">{p.categoryName}</div>
                      <div className="text-xs font-bold text-ink">{formatBDT(p.price)}</div>
                    </div>
                    <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", active ? "border-primary bg-primary text-white" : "border-line-strong")}>
                      {active && <Icon name="check" className="text-sm" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card space-y-4 p-5">
            <h2 className="font-display text-lg font-bold text-ink">Shared bundle summary</h2>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted">Group budget</span>
                <span className={cn("font-semibold", over ? "text-danger" : "text-secondary")}>
                  {over ? `${formatBDT(-remaining)} over` : `${formatBDT(remaining)} left`}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={800000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-high accent-primary"
                aria-label="Group budget"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted">
                <span>৳ 50,000</span>
                <span className="font-display font-bold text-ink">{formatBDT(budget)}</span>
                <span>৳ 800,000</span>
              </div>
            </div>

            <ProgressBar value={progress} tone={over ? "danger" : "gradient"} />
            {over && (
              <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                <Icon name="warning" className="text-base" />
                Over group budget.
              </div>
            )}

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {chosen.length === 0 && (
                <div className="rounded-lg border border-dashed border-line py-6 text-center text-xs text-muted">
                  Select products from the shared list.
                </div>
              )}
              {chosen.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-lg border border-line bg-canvas p-2">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-surface">
                    <Image src={p.image} alt={p.name} fill sizes="36px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-xs font-semibold text-ink">{p.name}</div>
                    <div className="text-[10px] text-muted">{formatBDT(p.price)}</div>
                  </div>
                  <span className="text-[10px] text-muted">{formatBDT(Math.round(p.price / Math.max(1, members.length)))} ea</span>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between border-t border-line pt-3">
              <span className="text-sm text-muted">Group total</span>
              <span className={cn("font-display text-2xl font-bold", over ? "text-danger" : "text-ink")}>
                {formatBDT(total)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-xs">
              <span className="text-muted">Split {members.length} ways</span>
              <span className="font-semibold text-secondary">{formatBDT(perMember)} / member</span>
            </div>

            <button
              onClick={() => chosen.forEach((p) => addItem(p))}
              disabled={chosen.length === 0}
              className="btn-neo w-full"
            >
              <CartLogo size={16} />
              Add group bundle to bag
            </button>
            <p className="text-center text-[11px] text-muted">
              Escrow holds contributions until every member confirms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
