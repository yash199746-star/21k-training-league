export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1829", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "430px", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
}
