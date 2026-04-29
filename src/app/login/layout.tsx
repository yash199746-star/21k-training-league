export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D1829] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen">
        {children}
      </div>
    </div>
  );
}
