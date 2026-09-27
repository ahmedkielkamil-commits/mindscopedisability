import { Link, Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5" style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
        <Link to="/" className="flex items-center">
          <img src="/Primary_Logo.png" alt="MindScope" className="h-10 w-auto object-contain" />
        </Link>

        <nav className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>About</a>
          <a href="#" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>Our Mission</a>
          <a href="#" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>Contact</a>
        </nav>
      </header>

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--card)" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/Primary_Logo.png" alt="MindScope" className="h-7 w-auto object-contain" />
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <a href="mailto:contact@mindscope.com" className="hover:opacity-70 transition-opacity">Contact</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Privacy Policy</a>
            <a href="#" className="hover:opacity-70 transition-opacity">About the Team</a>
          </div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>© 2025 MindScope. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
