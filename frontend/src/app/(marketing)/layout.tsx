import { MarketingNav } from '@/components/layout/MarketingNav'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-[#060709]">
      <MarketingNav />
      <main>{children}</main>
    </div>
  )
}
