"use client";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/app/_components/calendar";
import DatePickerInput from "@/app/_components/date-picker-input";
import { Drawer } from "vaul";
import { Button } from "@/app/_components/button";
import dayjs from "dayjs";

export interface Step01DateRangeProps { onSelect: (date: DateRange) => void; inputSelectedRange: DateRange | undefined; }

export default function Step01DateRange({ onSelect, inputSelectedRange }: Step01DateRangeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [calenderSelectedRange, setCalenderSelectedRange] = useState<DateRange | undefined>(inputSelectedRange);
  const onClickOk = () => { if (calenderSelectedRange) onSelect(calenderSelectedRange); setIsOpen(false); };
  useEffect(() => { if (inputSelectedRange) setCalenderSelectedRange(inputSelectedRange); }, [inputSelectedRange, isOpen]);
  return (
    <div className="flex items-center gap-[8px]">
      <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Trigger asChild>
          <button><DatePickerInput label="Departure Date" placeholder="25.07.11" value={inputSelectedRange?.from ? dayjs(inputSelectedRange.from).format("YY.MM.DD") : ""} /></button>
        </Drawer.Trigger>
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="62" viewBox="0 0 15 62" fill="none"><path d="M3.96191 46.9858H12.0389" stroke="black"/></svg>
        <Drawer.Trigger asChild>
          <button><DatePickerInput label="Arrival Date" placeholder="25.07.18" value={inputSelectedRange?.to ? dayjs(inputSelectedRange.to).format("YY.MM.DD") : ""} /></button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[28px] fixed bottom-0 left-0 right-0 z-50 w-full max-w-[393px] mx-auto p-4">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-gray-300 mb-4" />
            <h3 className="text-center font-bold text-lg mb-4">날짜 선택</h3>
            <Calendar mode="range" className="rounded-lg border mx-auto" selected={calenderSelectedRange} onSelect={setCalenderSelectedRange} />
            <div className="flex justify-end gap-2 mt-4">
              <Drawer.Close asChild><Button variant="ghost" size="lg">Cancel</Button></Drawer.Close>
              <Button size="lg" className="bg-[#ee7f12] text-white" onClick={onClickOk}>Ok</Button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
