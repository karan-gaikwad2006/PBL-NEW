import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#304355] text-white mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 w-full grid grid-cols-1 md:grid-cols-4 gap-8 text-slate-200">
        {/* Brand Column */}
        <div className="md:col-span-1 space-y-4">
          <Link to="/" className="inline-block hover:opacity-90 transition">
            <div className="bg-white/95 backdrop-blur-xs rounded-xl px-4 py-2.5 shadow-xs inline-block">
              <img 
                src={logo} 
                alt="PoshanSetu — Bridge of Nutrition • Community Care" 
                className="h-20 sm:h-24 md:h-28 w-auto object-contain" 
              />
            </div>
          </Link>
          <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
            Empowering communities through nutrition intelligence. Bridging the gap between surplus and scarcity.
          </p>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/explore" className="hover:text-white transition">Explore Needs</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
            <li><Link to="/submit-requirement" className="hover:text-white transition">Submit a Requirement</Link></li>
          </ul>
        </div>

        {/* About Links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">About</h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li><Link to="/about" className="hover:text-white transition">Our Mission</Link></li>
            <li><Link to="/about" className="hover:text-white transition">Data Methodology</Link></li>
            <li><Link to="/explore" className="hover:text-white transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition">Disclaimer</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-300">
        © 2024 PoshanSetu. All rights reserved.
      </div>
    </footer>
  );
}
