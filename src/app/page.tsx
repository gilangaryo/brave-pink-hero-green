'use client';

import DuotoneConverter from './components/DuotoneConverter';
import { Palette } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-600 to-pink-500 flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-pink-500 bg-clip-text text-transparent">
              BRAVE PINK HERO GREEN INDONESIA
            </h1>
          </div>
          <p className="text-gray-600 mt-2">Semua proses di browser. Tidak menyimpan data dari perangkatmu.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <DuotoneConverter
          shadowHex="#145527"
          highlightHex="#F784C5"
        // onChange={(url) => {
        //   console.log('Hasil dataURL:', url?.slice(0, 64) + '...');
        // }}
        />
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Brave Pink Hero Green Dxkoa
        </div>
      </footer>
    </div>
  );
}
