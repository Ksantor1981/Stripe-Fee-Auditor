import { LandingNav } from "@/components/LandingNav";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Shared marketing chrome: full nav on legal, blog, SEO, and docs pages. */
export function MarketingShell({ children, className = "min-h-screen page-canvas" }: Props) {
  return (
    <div className={className}>
      <div className="sticky top-0 z-50 bg-[#fbfbf8]/95 backdrop-blur-sm border-b border-gray-200 shadow-sm shadow-gray-100/50">
        <LandingNav />
      </div>
      {children}
    </div>
  );
}
