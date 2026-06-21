interface OnboardingTitleProps {
  title: string;
  subtitle?: string;
  dark?: boolean;
}

export default function OnboardingTitle({ title, subtitle, dark }: OnboardingTitleProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>{title}</h1>
      {subtitle && <p className={`text-sm ${dark ? "text-[#635c78]" : "text-gray-500"}`}>{subtitle}</p>}
    </div>
  );
}
