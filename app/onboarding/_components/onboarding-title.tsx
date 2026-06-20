interface OnboardingTitleProps {
  title: string;
  subtitle?: string;
}

export default function OnboardingTitle({ title, subtitle }: OnboardingTitleProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
