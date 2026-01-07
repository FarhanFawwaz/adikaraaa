import { Navbar } from "./Navbar";

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark text-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-card-dark border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} NeuroRehab AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
