export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {children}
    </div>
  )
}
