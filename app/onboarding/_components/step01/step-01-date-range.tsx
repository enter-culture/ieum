"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/app/_components/calendar";
import DatePickerInput from "@/app/_components/date-picker-input";
import { Button } from "@/app/_components/button";
import dayjs from "dayjs";

export interface Step01DateRangeProps {
  onSelect: (date: DateRange) => void;
  inputSelectedRange: DateRange | undefined;
}

export default function Step01DateRange({ onSelect, inputSelectedRange }: Step01DateRangeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [calenderSelectedRange, setCalenderSelectedRange] = useState<DateRange | undefined>(inputSelectedRange);

  const onClickOk = () => {
    if (calenderSelectedRange) onSelect(calenderSelectedRange);
    setIsOpen(false);
  };

  useEffect(() => {
    if (inputSelectedRange) setCalenderSelectedRange(inputSelectedRange);
  }, [inputSelectedRange, isOpen]);

  return (
    <div className="flex items-center gap-[8px]">
      <button onClick={() => setIsOpen(true)}>
        <DatePickerInput
          label="출발일"
          placeholder="25.07.11"
          value={inputSelectedRange?.from ? dayjs(inputSelectedRange.from).format("YY.MM.DD") : ""}
        />
      </button>

      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="62" viewBox="0 0 15 62" fill="none">
        <path d="M3.96191 46.9858H12.0389" stroke="black" />
      </svg>

      <button onClick={() => setIsOpen(true)}>
        <DatePickerInput
          label="도착일"
          placeholder="25.07.18"
          value={inputSelectedRange?.to ? dayjs(inputSelectedRange.to).format("YY.MM.DD") : ""}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-5 w-[calc(100%-32px)] max-w-[360px] shadow-xl">
            <h3 className="text-center font-bold text-lg mb-4">방문 날짜 선택</h3>
            <Calendar
              mode="range"
              className="rounded-lg border mx-auto"
              selected={calenderSelectedRange}
              onSelect={setCalenderSelectedRange}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="lg" onClick={() => setIsOpen(false)}>
                취소
              </Button>
              <Button size="lg" className="bg-[#ee7f12] text-white" onClick={onClickOk}>
                확인
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
