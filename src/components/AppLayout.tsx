import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col pb-16 relative">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
