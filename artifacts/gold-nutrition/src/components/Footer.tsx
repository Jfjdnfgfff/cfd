import { Phone, MapPin, Facebook, Dumbbell } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-yellow-900/25 mt-20">
      {/* Gold divider */}
      <div className="gold-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center shadow-lg shadow-yellow-900/40">
                <Dumbbell className="w-4 h-4 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-bold text-white text-sm leading-none block">
                  GOLD NUTRITION
                </span>
                <span className="text-yellow-500 text-xs font-semibold tracking-widest">
                  ROUIBA
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your trusted supplement store in Rouiba. Premium quality products for your fitness goals.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-4">
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href="tel:0549195666"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-yellow-600" />
                0549 195 666
              </a>
              <a
                href="tel:0557113327"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-yellow-600" />
                0557 113 327
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-4">
              Find Us
            </h4>
            <div className="space-y-3">
              <a
                href="https://www.facebook.com/share/1KTFBn2dV7/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm"
              >
                <Facebook className="w-4 h-4 text-yellow-600" />
                Gold Nutrition Rouiba
              </a>
              <a
                href="https://maps.app.goo.gl/xucjzoRFYjSK6dUF6?g_st=aw"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm"
              >
                <MapPin className="w-4 h-4 text-yellow-600" />
                View on Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-yellow-900/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-600 text-xs">
          <span>© {new Date().getFullYear()} Gold Nutrition Rouiba. All rights reserved.</span>
          <span>Built with 💛 for champions</span>
        </div>
      </div>
    </footer>
  );
}
