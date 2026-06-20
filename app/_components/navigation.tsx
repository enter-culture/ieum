"use client";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const setActiveColor = useMemo(() => {
    return (route: string) => pathname.startsWith(route) ? "text-[#ee7f12]" : "text-gray-400";
  }, [pathname]);

  const EXCLUDE_NAVIGATION_PATHS = ["/onboarding", "/plan"];
  const isExcludeNavigation = EXCLUDE_NAVIGATION_PATHS.some(
    (path) => pathname.startsWith(path) || pathname === "/"
  );
  if (isExcludeNavigation) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 h-20 max-w-[393px] w-full -translate-x-1/2 bg-white">
      <ul className="flex items-center justify-around h-full">
        <li>
          <button className="flex flex-col items-center justify-center gap-2 h-full w-full p-4" onClick={() => router.push("/explore")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" className={setActiveColor("/explore")}>
              <path d="M20.35 21L14.05 14.7C13.55 15.1 12.975 15.4167 12.325 15.65C11.675 15.8833 10.9833 16 10.25 16C8.43333 16 6.89583 15.3708 5.6375 14.1125C4.37917 12.8542 3.75 11.3167 3.75 9.5C3.75 7.68333 4.37917 6.14583 5.6375 4.8875C6.89583 3.62917 8.43333 3 10.25 3C12.0667 3 13.6042 3.62917 14.8625 4.8875C16.1208 6.14583 16.75 7.68333 16.75 9.5C16.75 10.2333 16.6333 10.925 16.4 11.575C16.1667 12.225 15.85 12.8 15.45 13.3L21.75 19.6L20.35 21ZM10.25 14C11.5 14 12.5625 13.5625 13.4375 12.6875C14.3125 11.8125 14.75 10.75 14.75 9.5C14.75 8.25 14.3125 7.1875 13.4375 6.3125C12.5625 5.4375 11.5 5 10.25 5C9 5 7.9375 5.4375 7.0625 6.3125C6.1875 7.1875 5.75 8.25 5.75 9.5C5.75 10.75 6.1875 11.8125 7.0625 12.6875C7.9375 13.5625 9 14 10.25 14Z" fill="currentColor"/>
            </svg>
            <span className={clsx("text-xs", setActiveColor("/explore"))}>탐색</span>
          </button>
        </li>
        <li>
          <button className="flex flex-col items-center justify-center gap-2 h-full w-full p-4" onClick={() => router.push("/saved")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" className={setActiveColor("/saved")}>
              <path d="M5.41602 21V5C5.41602 4.45 5.61185 3.97917 6.00352 3.5875C6.39518 3.19583 6.86602 3 7.41602 3H17.416C17.966 3 18.4368 3.19583 18.8285 3.5875C19.2202 3.97917 19.416 4.45 19.416 5V21L12.416 18L5.41602 21ZM7.41602 17.95L12.416 15.8L17.416 17.95V5H7.41602V17.95Z" fill="currentColor"/>
            </svg>
            <span className={clsx("text-xs", setActiveColor("/saved"))}>저장</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
