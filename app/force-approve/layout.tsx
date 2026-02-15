// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export default function ForceApproveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
