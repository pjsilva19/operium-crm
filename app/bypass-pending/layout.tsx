// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export default function BypassPendingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
