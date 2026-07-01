export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hachi-teal-500/5 via-background to-hachi-teal-500/10">
      {children}
    </div>
  );
}
