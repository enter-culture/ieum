import { render, screen, fireEvent } from "@testing-library/react";
import BoardingPassFan from "../BoardingPassFan";

jest.mock("../BoardingPassCard", () => ({
  __esModule: true,
  default: ({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) => (
    <button onClick={onClick}>{isSelected ? `✓ SELECTED ${label}` : label}</button>
  ),
}));

const options = [
  { label: "음악", value: 1, emoji: "🎵" },
  { label: "무용", value: 2, emoji: "💃" },
  { label: "연극", value: 3, emoji: "🎭" },
];

describe("BoardingPassFan", () => {
  it("모든 옵션 카드를 렌더링한다", () => {
    render(
      <BoardingPassFan options={options} selectedValues={[]} onSelect={jest.fn()} />
    );
    expect(screen.getByText("음악")).toBeInTheDocument();
    expect(screen.getByText("무용")).toBeInTheDocument();
    expect(screen.getByText("연극")).toBeInTheDocument();
  });

  it("카드 클릭 시 onSelect가 해당 value로 호출된다", () => {
    const onSelect = jest.fn();
    render(
      <BoardingPassFan options={options} selectedValues={[]} onSelect={onSelect} />
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("selectedValues에 포함된 카드는 선택 상태로 표시된다", () => {
    render(
      <BoardingPassFan options={options} selectedValues={[1]} onSelect={jest.fn()} />
    );
    expect(screen.getByText("✓ SELECTED 음악")).toBeInTheDocument();
  });

  it("선택된 카드 재클릭 시 onSelect가 다시 호출된다 (해제는 부모가 처리)", () => {
    const onSelect = jest.fn();
    render(
      <BoardingPassFan options={options} selectedValues={[1]} onSelect={onSelect} />
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
