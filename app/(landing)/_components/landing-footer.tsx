import Link from "next/link";
export default function LandingFooter() {
  return (
    <div className="w-full px-6 pb-10 pt-4 bg-[#e8e8e8]">
      <Link href="/onboarding" className="block w-full">
        <button className="w-full py-4 rounded-xl bg-[#ee7f12] text-white text-base font-semibold hover:bg-[#e77011] active:scale-[0.98] transition-all duration-150">
          Go
        </button>
      </Link>
    </div>
  );
}
