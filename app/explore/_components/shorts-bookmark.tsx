"use client";

interface ShortsBookmarkProps {
  isBookmarked: boolean;
  onToggle: () => void;
}

export default function ShortsBookmark({ isBookmarked, onToggle }: ShortsBookmarkProps) {
  return (
    <button
      onClick={onToggle}
      className="flex flex-col items-center gap-1"
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill={isBookmarked ? "white" : "none"}
        stroke="white"
        strokeWidth="2"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span className="text-white text-xs">{isBookmarked ? "Saved" : "Save"}</span>
    </button>
  );
}
