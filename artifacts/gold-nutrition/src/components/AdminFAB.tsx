import { useState } from "react";
import { LayoutDashboard, X } from "lucide-react";
import { Link } from "wouter";

export default function AdminFAB() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href="/admin">
      <div
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 cursor-pointer group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        dir="rtl"
      >
        {/* تسمية توضيحية تظهر عند التحويم */}
        <div
          className={`bg-[#111] border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg transition-all duration-200 whitespace-nowrap ${
            hovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2 pointer-events-none"
          }`}
        >
          لوحة التحكم
        </div>

        {/* الزر الدائري */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-900/50 flex items-center justify-center transition-all duration-200 group-hover:shadow-yellow-500/40 group-hover:scale-110 group-active:scale-95">
          <LayoutDashboard className="w-5 h-5 text-black" strokeWidth={2.2} />
        </div>
      </div>
    </Link>
  );
}
