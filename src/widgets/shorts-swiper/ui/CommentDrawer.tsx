"use client";
import { useState, useRef, useEffect } from "react";

interface Comment {
  id: number;
  text: string;
  createdAt: string;
}

interface CommentDrawerProps {
  open: boolean;
  onClose: () => void;
  videoTitle: string;
}

export default function CommentDrawer({ open, onClose, videoTitle }: CommentDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, text: "정말 멋진 문화재네요!", createdAt: "방금 전" },
    { id: 2, text: "처음 봤는데 너무 신기해요 😮", createdAt: "1분 전" },
  ]);
  const [input, setInput] = useState("");
  const [dragY, setDragY] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(3);
  const startY = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    setComments((prev) => [
      { id: idRef.current++, text, createdAt: "방금 전" },
      ...prev,
    ]);
    setInput("");
  };

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* 드로어 */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl flex flex-col"
        style={{
          height: "90dvh",
          transform: open ? `translateY(${Math.max(0, dragY)}px)` : "translateY(100%)",
          transition: dragY ? "none" : "transform 0.35s cubic-bezier(.32,.72,0,1)",
        }}
        onTouchStart={(e) => { startY.current = e.touches[0].clientY; }}
        onTouchMove={(e) => {
          if (startY.current === null) return;
          setDragY(Math.max(0, e.touches[0].clientY - startY.current));
        }}
        onTouchEnd={() => {
          if (dragY > 100) onClose();
          setDragY(0);
          startY.current = null;
        }}
        onMouseDown={(e) => { startY.current = e.clientY; isDragging.current = true; }}
        onMouseMove={(e) => {
          if (!isDragging.current || startY.current === null) return;
          setDragY(Math.max(0, e.clientY - startY.current));
        }}
        onMouseUp={() => {
          if (dragY > 100) onClose();
          setDragY(0);
          startY.current = null;
          isDragging.current = false;
        }}
        onMouseLeave={() => {
          if (isDragging.current) {
            if (dragY > 100) onClose();
            setDragY(0);
            startY.current = null;
            isDragging.current = false;
          }
        }}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* 헤더 */}
        <div className="px-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-800 text-center">
            댓글 {comments.length}개
          </h3>
        </div>

        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-8">첫 댓글을 남겨보세요!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs text-gray-500 font-bold">
                  나
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400">{c.createdAt}</span>
                  <p className="text-sm text-gray-800">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 입력창 */}
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-center flex-shrink-0 pb-safe">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs text-gray-500 font-bold">
            나
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } }}
            placeholder="댓글 추가..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="text-[#ee7f12] font-bold text-sm disabled:opacity-30"
          >
            게시
          </button>
        </div>
      </div>
    </>
  );
}
