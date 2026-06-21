"use client";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    path: "/explore",
    label: "쇼츠",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polygon points="5,3 19,12 5,21"/>
      </svg>
    ),
  },
  {
    path: "/upload",
    label: "",
    isCenter: true,
    icon: (_active: boolean) => (
      <div className="w-12 h-12 rounded-2xl bg-[#ee7f12] flex items-center justify-center shadow-lg" style={{ boxShadow: "0 4px 14px rgba(238,127,18,0.4)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    ),
  },
  {
    path: "/destinations",
    label: "여행지",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill={active ? "white" : "currentColor"}/>
      </svg>
    ),
  },
  {
    path: "/likes",
    label: "좋아요",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    path: "/profile",
    label: "프로필",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const HIDE_NAV = ["/onboarding", "/heritage"];

export default function Navigation() {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  if (HIDE_NAV.some((p) => pathname.startsWith(p)) || pathname === "/") return null;

  const isExplore = pathname.startsWith("/explore");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: isExplore ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        borderTop: isExplore ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center h-16">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path || (item.path !== "/upload" && pathname.startsWith(item.path));
          const color = isExplore ? "white" : active ? "#ee7f12" : "#9ca3af";

          if (item.isCenter) {
            return (
              <button key={item.path} onClick={() => router.push(item.path)} className="flex-1 flex items-center justify-center">
                {item.icon(false)}
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center gap-0.5 flex-1 py-1"
              style={{ color }}
            >
              {item.icon(active && !isExplore)}
              {item.label && <span className="text-[10px] font-medium">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
