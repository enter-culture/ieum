import { render, screen, fireEvent } from "@testing-library/react";
import BoardingPassCard from "../BoardingPassCard";

const defaultProps = {
  label: "음악",
  emoji: "🎵",
  isSelected: false,
  onClick: jest.fn(),
};

describe("BoardingPassCard", () => {
  it("카테고리 이름을 렌더링한다", () => {
    render(<BoardingPassCard {...defaultProps} />);
    expect(screen.getByText("음악")).toBeInTheDocument();
  });

  it("비선택 상태에서는 SELECTED 배지가 없다", () => {
    render(<BoardingPassCard {...defaultProps} isSelected={false} />);
    expect(screen.queryByText("✓ SELECTED")).not.toBeInTheDocument();
  });

  it("선택 상태에서는 SELECTED 배지가 표시된다", () => {
    render(<BoardingPassCard {...defaultProps} isSelected={true} />);
    expect(screen.getByText("✓ SELECTED")).toBeInTheDocument();
  });

  it("클릭하면 onClick이 호출된다", () => {
    const onClick = jest.fn();
    render(<BoardingPassCard {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
