import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Brain,
  LayoutDashboard,
  Network,
  Search,
  LogOut,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Crown,
  Zap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu";
import { useAuthStore } from "../../store/auth.store";
import { useTheme } from "../../lib/theme";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/graph", icon: Network, label: "Graph", pro: true },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const { user, clearAuth } = useAuthStore();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";
  const isPro = user?.plan === "pro";

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen bg-app overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          style={{
            width: collapsed ? "64px" : "220px",
            transition: "width 250ms cubic-bezier(0.4,0,0.2,1)",
          }}
          className="relative flex flex-col bg-app-2 border-r border-app shrink-0 overflow-hidden"
        >
          {/* Logo row */}
          <div className="flex items-center h-14 px-3 border-b border-app shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgb(var(--brand))" }}
            >
              <Brain className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="ml-3 font-semibold text-app text-sm tracking-tight whitespace-nowrap overflow-hidden">
                Second Brain
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
            {navItems.map(({ to, icon: Icon, label, pro }) => (
              <Tooltip key={to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-2.5 py-2.5 rounded-xl
                       text-sm font-medium transition-all duration-150 relative
                       ${
                         isActive
                           ? "bg-brand-soft text-brand"
                           : "text-app-2 hover:text-app hover:bg-app-3"
                       }
                       ${collapsed ? "justify-center" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-brand" />
                        )}
                        <Icon className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 whitespace-nowrap">
                              {label}
                            </span>
                            {pro && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-brand-soft text-brand uppercase tracking-wide">
                                Pro
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="px-2 py-3 border-t border-app space-y-0.5 shrink-0">
            {/* Upgrade banner — only free users, expanded */}
            {!isPro && !collapsed && (
              <div className="mb-2 px-3 py-2.5 rounded-xl bg-brand-soft border border-brand/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3.5 h-3.5 text-brand" />
                  <span className="text-xs font-semibold text-brand">
                    Upgrade to Pro
                  </span>
                </div>
                <p className="text-[11px] text-app-2 leading-snug">
                  Unlock semantic search, graph & more
                </p>
              </div>
            )}

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggle}
                  className={`flex items-center gap-3 w-full px-2.5 py-2.5 rounded-xl
                    text-sm text-app-2 hover:text-app hover:bg-app-3
                    transition-all duration-150
                    ${collapsed ? "justify-center" : ""}`}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 shrink-0 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 shrink-0 text-indigo-400" />
                  )}
                  {!collapsed && (
                    <span className="text-sm whitespace-nowrap">
                      {isDark ? "Light mode" : "Dark mode"}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="text-xs">
                  {isDark ? "Light mode" : "Dark mode"}
                </TooltipContent>
              )}
            </Tooltip>

            {/* User row */}
            {collapsed ? (
              <DropdownMenu>
                <div className="flex justify-center mt-1">
                  <DropdownMenuTrigger asChild>
                    <button
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 outline-none"
                      style={{ background: "rgb(var(--brand))" }}
                    >
                      {initial}
                    </button>
                  </DropdownMenuTrigger>
                </div>

                <DropdownMenuContent
                  side="right"
                  align="end"
                  sideOffset={14}
                  className="w-48 bg-app-2 border-app rounded-xl shadow-card p-2"
                >
                  {/* User info */}
                  <div className="px-2 py-2 border-b border-app mb-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: "rgb(var(--brand))" }}
                      >
                        {initial}
                      </div>
                      <p className="text-xs font-medium text-app truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 pl-8">
                      {isPro ? (
                        <>
                          <Crown className="w-2.5 h-2.5 text-amber-400" />
                          <span className="text-[10px] text-amber-400 font-semibold">
                            Pro plan
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-app-2">
                          Free plan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-2 py-2 rounded-lg
                      text-xs text-app-2 hover:text-red-400 hover:bg-red-500/10
                      transition-all duration-150 outline-none"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-app-3 mt-1">
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "rgb(var(--brand))" }}
                >
                  {initial}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-app truncate leading-tight">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isPro ? (
                      <>
                        <Crown className="w-2.5 h-2.5 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-semibold">
                          Pro
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-app-2">Free</span>
                    )}
                  </div>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className="text-app-3 hover:text-red-400 transition-colors shrink-0 p-1 rounded-lg hover:bg-red-500/10"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    Sign out
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* ── Collapse toggle — fixed to sidebar edge ───── */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3.5 top-[3.25rem] z-20
              w-7 h-7 rounded-full
              bg-app-2 border border-app shadow-card
              flex items-center justify-center
              hover:bg-app-3 transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5 text-app-2" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5 text-app-2" />
            )}
          </button>
        </aside>

        {/* ── Main ─────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-app">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
