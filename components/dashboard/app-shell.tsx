"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Radar, Coins, PenLine, HandCoins, Blocks, Settings,
  ChevronsUpDown, Menu, X, ExternalLink, Plus, Check, Bell,
} from "lucide-react";
import { Wordmark, Mark } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { db } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/intent", label: "Intent Explorer", icon: Radar },
  { href: "/dashboard/revenue", label: "Affiliate Revenue", icon: Coins },
  { href: "/dashboard/content-gaps", label: "Content Gaps", icon: PenLine, badge: "Draft" },
  { href: "/dashboard/bounties", label: "Bounty Inbox", icon: HandCoins, count: 2 },
  { href: "/dashboard/widget", label: "Widget Studio", icon: Blocks },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface-2 lg:flex">
        <SidebarInner pathname={pathname} />
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-line bg-surface-2 animate-rise">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 rounded-md p-1.5 text-ink-subtle hover:bg-paper-2">
              <X className="size-4" />
            </button>
            <SidebarInner pathname={pathname} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        {/* top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/85 px-4 backdrop-blur lg:px-7">
          <button onClick={() => setMobileOpen(true)} className="rounded-md p-2 text-ink-muted hover:bg-surface-2 lg:hidden">
            <Menu className="size-5" />
          </button>

          <div className="flex flex-1 items-center gap-3">
            <Select defaultValue="30d">
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <a href="/demo" target="_blank"
            className="hidden items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2 sm:inline-flex">
            View live site <ExternalLink className="size-3.5" />
          </a>

          <button className="relative rounded-lg p-2 text-ink-muted hover:bg-surface-2">
            <Bell className="size-5" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none">
                <Avatar><AvatarFallback>{db.site.author.avatarInitials}</AvatarFallback></Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{db.site.author.name}</DropdownMenuLabel>
              <DropdownMenuItem>Account</DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/dashboard/settings">Billing & plan</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/">Sign out</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({ pathname }: { pathname: string }) {
  return (
    <>
      <div className="px-5 py-5">
        <Link href="/"><Wordmark /></Link>
      </div>

      <div className="px-3">
        <SiteSwitcher />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-surface text-ink edge" : "text-ink-muted hover:bg-surface/60 hover:text-ink"
              )}>
              <item.icon className={cn("size-[18px] shrink-0", active ? "text-accent" : "text-ink-subtle")} />
              <span className="flex-1">{item.label}</span>
              {item.badge && <Badge variant="plum" className="px-1.5 py-0 text-[10px]">{item.badge}</Badge>}
              {item.count && (
                <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-ink">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <PlanCard />
      </div>
    </>
  );
}

function SiteSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-2 edge">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft">
            <Mark className="size-4" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-ink">{db.site.name}</span>
            <span className="block truncate text-xs text-ink-muted">{db.site.domain}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-ink-subtle" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[228px]" align="start">
        <DropdownMenuLabel>Your sites</DropdownMenuLabel>
        <DropdownMenuItem>
          <Check className="size-4 text-accent" />
          <span className="flex-1">{db.site.name}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-ink-muted">
          <Plus className="size-4" /> Add a site
          <Badge variant="outline" className="ml-auto">Studio</Badge>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PlanCard() {
  const used = 3380;
  const cap = 5000;
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5 edge">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Pro plan</span>
        <Badge>$29/mo</Badge>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>Questions this month</span>
          <span className="tnum">{used.toLocaleString()} / {cap.toLocaleString()}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-2">
          <div className="h-full rounded-full bg-accent" style={{ width: `${(used / cap) * 100}%` }} />
        </div>
      </div>
      <Link href="/dashboard/settings?tab=plan" className="mt-3 block text-center text-xs font-medium text-accent hover:underline">
        Manage plan
      </Link>
    </div>
  );
}
