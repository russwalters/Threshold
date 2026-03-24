import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linen px-4 py-12">
      <div className="mb-8 animate-fade-in">
        <Logo size="large" />
      </div>
      <div className="w-full max-w-md animate-fade-in" style={{ animationDelay: "100ms" }}>
        {children}
      </div>
      <p className="mt-8 text-xs text-stone animate-fade-in" style={{ animationDelay: "200ms" }}>
        &copy; {new Date().getFullYear()} Threshold. All rights reserved.
      </p>
    </div>
  );
}
