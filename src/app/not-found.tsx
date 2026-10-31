import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-black text-heritage-gold mb-2">404 — Page Not Found</h2>
      <p className="text-slate-400 text-sm mb-6 max-w-md">The requested heritage locus or digital twin asset could not be located.</p>
      <Link href="/" className="px-5 py-2.5 bg-heritage-gold text-slate-950 font-bold rounded-xl text-sm">
        Return Home
      </Link>
    </div>
  );
}

