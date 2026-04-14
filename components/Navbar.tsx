
import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';
import { Menu, X, User, Search, Facebook, Mail, ChevronDown, Globe } from 'lucide-react';
// @ts-ignore
import NepaliDate from 'nepali-date-converter';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isAdmin: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStaffDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toNepaliNumerals = (num: number | string) => {
    const nepaliNums = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(d => nepaliNums[parseInt(d)] || d).join('');
  };

  const getNepaliDateParts = (date: Date) => {
    // Use nepali-date-converter library for accurate conversion
    const npDate = new NepaliDate(date);
    
    const nepaliMonths = ["बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कात्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत"];
    const nepaliDays = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"];
    
    return {
      year: toNepaliNumerals(npDate.getYear()),
      month: nepaliMonths[npDate.getMonth()],
      day: toNepaliNumerals(npDate.getDate()),
      dayName: nepaliDays[npDate.getDay()],
      time: date.toLocaleTimeString('ne-NP', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };
  };

  const dateParts = getNepaliDateParts(currentTime);

  const navItems = [
    { label: 'हाम्रो बारेमा', view: 'ABOUT' as ViewState },
    { label: 'सेवाहरू', view: 'SERVICES' as ViewState },
    { label: 'सूचनाहरू', view: 'NOTICES' as ViewState },
    { label: 'डाउनलोड', view: 'DOWNLOADS' as ViewState },
  ];

  const staffSubItems = [
    { label: 'स्वास्थ्य संस्था व्यवस्थापन समिति', view: 'COMMITTEE' as ViewState },
    { label: 'प्रमुखहरू', view: 'CHIEFS' as ViewState },
    { label: 'हाल कार्यरत कर्मचारीहरू', view: 'CURRENT_STAFF' as ViewState },
    { label: 'पूर्व कर्मचारीहरू', view: 'FORMER_STAFF' as ViewState },
  ];

  const isStaffViewActive = ['COMMITTEE', 'CHIEFS', 'CURRENT_STAFF', 'FORMER_STAFF'].includes(currentView);

  return (
    <header className="w-full flex flex-col z-50 sticky top-0 bg-white">
      {/* Official Blue Header Bar */}
      <div className="bg-[#1e3a8a] text-white py-2 md:py-3 px-4 md:px-8 border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          {/* Logo and Name */}
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer group" onClick={() => setView('HOME')}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Emblem_of_Nepal.svg" alt="Nepal Emblem" className="h-10 md:h-14 w-auto group-hover:scale-110 transition-transform" />
            <div className="flex flex-col items-start">
              <span className="text-[10px] md:text-[11px] font-black opacity-80 uppercase tracking-widest text-blue-200">चौदण्डीगढी नगरपालिका</span>
              <h1 className="text-base md:text-xl font-black leading-tight tracking-tight">आधारभूत नगर अस्पताल</h1>
              <span className="text-[10px] md:text-[11px] font-bold opacity-70 text-blue-100">बेल्टार, उदयपुर, कोशी प्रदेश</span>
            </div>
          </div>
          
          {/* Date and Time Info (NST Based) */}
          <div className="flex items-center gap-3 md:gap-4 bg-white/10 backdrop-blur-lg p-1.5 md:p-2 rounded-2xl border border-white/20 shadow-lg">
            <div className="h-10 md:h-14 w-10 md:w-14 flex items-center justify-center overflow-hidden bg-white/10 rounded-xl">
              <img 
                src="https://giwmscdnone.gov.np/static/grapejs/img/Nepal-flag.gif" 
                alt="Flag of Nepal" 
                className="w-7 md:w-9 h-auto drop-shadow-2xl"
              />
            </div>
            <div className="flex flex-col border-l border-white/20 pl-3 md:pl-4 text-left">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Globe size={12} className="text-blue-300 animate-spin-slow" />
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">नेपाल समय (NST)</span>
                <div className="flex items-center gap-1 ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Database Connected"></div>
                </div>
              </div>
              <span className="text-[12px] md:text-[15px] font-black leading-tight tracking-wide text-white">
                {dateParts.year} {dateParts.month} {dateParts.day}, {dateParts.dayName}
              </span>
              <span className="text-[10px] md:text-[11px] text-blue-300 font-bold leading-tight mt-0.5">
                समय: {dateParts.time}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-white text-slate-800 shadow-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">
          <div className="hidden md:flex items-center space-x-1 h-full">
            <button onClick={() => setView('HOME')} className={`px-4 h-full text-sm font-black border-b-4 transition-all ${currentView === 'HOME' ? 'border-blue-700 bg-blue-50 text-blue-700 shadow-inner' : 'border-transparent hover:bg-slate-50'}`}>गृहपृष्ठ</button>
            
            {navItems.map((item) => (
              <button key={item.label} onClick={() => setView(item.view)} className={`px-4 h-full text-sm font-black border-b-4 transition-all ${currentView === item.view ? 'border-blue-700 bg-blue-50 text-blue-700 shadow-inner' : 'border-transparent hover:bg-slate-50'}`}>
                {item.label}
              </button>
            ))}

            <div className="relative h-full" ref={dropdownRef}>
              <button 
                onClick={() => setStaffDropdownOpen(!staffDropdownOpen)}
                className={`px-4 h-full flex items-center gap-1 text-sm font-black border-b-4 transition-all ${isStaffViewActive ? 'border-blue-700 bg-blue-50 text-blue-700 shadow-inner' : 'border-transparent hover:bg-slate-50'}`}
              >
                कर्मचारी तथा समिति <ChevronDown size={14} className={`opacity-50 transition-transform ${staffDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {staffDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-white border border-slate-200 shadow-2xl rounded-b-2xl py-3 animate-in fade-in slide-in-from-top-2 z-[100] border-t-4 border-t-blue-700">
                  {staffSubItems.map((sub) => (
                    <button
                      key={sub.label}
                      onClick={() => { setView(sub.view); setStaffDropdownOpen(false); }}
                      className={`w-full text-left px-6 py-3 text-sm font-bold hover:bg-blue-50 hover:text-blue-700 transition-colors border-l-4 ${currentView === sub.view ? 'text-blue-700 bg-blue-50 border-blue-700' : 'text-slate-700 border-transparent'}`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
            <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200 group focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <input type="text" placeholder="खोज्नुहोस्..." className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all font-bold text-slate-700 placeholder:text-slate-400" />
              <Search size={16} className="text-slate-400 group-focus-within:text-blue-600" />
            </div>
            
            <button 
              onClick={() => setView(isAdmin ? 'ADMIN_DASHBOARD' : 'ADMIN_LOGIN')} 
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all shadow-lg active:scale-95 group"
              aria-label="Admin Access"
            >
              <User size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-black hidden sm:inline uppercase tracking-widest">एडमिन लगइन</span>
            </button>
            
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden p-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
              aria-label="Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 animate-in slide-in-from-top duration-300 shadow-2xl overflow-hidden">
            <div className="flex flex-col p-3 space-y-1">
              <button 
                onClick={() => { setView('HOME'); setIsOpen(false); }} 
                className={`w-full text-left p-4 font-black rounded-xl border-l-4 ${currentView === 'HOME' ? 'bg-blue-50 text-blue-700 border-blue-700' : 'hover:bg-slate-50 border-transparent'}`}
              >
                गृहपृष्ठ
              </button>
              {navItems.map(item => (
                <button 
                  key={item.label} 
                  onClick={() => { setView(item.view); setIsOpen(false); }} 
                  className={`w-full text-left p-4 font-black rounded-xl border-l-4 ${currentView === item.view ? 'bg-blue-50 text-blue-700 border-blue-700' : 'hover:bg-slate-50 border-transparent'}`}
                >
                  {item.label}
                </button>
              ))}
              
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-lg mb-2">कर्मचारी तथा समिति</p>
                {staffSubItems.map(sub => (
                  <button 
                    key={sub.label} 
                    onClick={() => { setView(sub.view); setIsOpen(false); }} 
                    className={`w-full text-left py-3 px-6 text-sm font-black rounded-xl border-l-4 ${currentView === sub.view ? 'bg-blue-50 text-blue-700 border-blue-700' : 'text-slate-600 hover:bg-blue-50 border-transparent'}`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
