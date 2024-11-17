export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b p-4">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  )
}
