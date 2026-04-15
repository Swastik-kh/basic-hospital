
import React, { useState, useEffect } from 'react';
import { ViewState, Notice, Service, Doctor, DownloadItem } from './types';
import { INITIAL_NOTICES, INITIAL_SERVICES, INITIAL_DOCTORS, INITIAL_DOWNLOADS } from './constants';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Notices from './pages/Notices';
import Downloads from './pages/Downloads';
import AdminDashboard from './pages/AdminDashboard';
import { LogIn as LogInIcon, ShieldCheck as ShieldIcon, AlertCircle as AlertIcon, Users, MapPin, Layers, Briefcase } from 'lucide-react';
import { db } from './services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [downloads, setDownloads] = useState<DownloadItem[]>(INITIAL_DOWNLOADS);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'notices'));
        const fetchedNotices: Notice[] = [];
        querySnapshot.forEach((doc) => {
          fetchedNotices.push({ id: doc.id, ...doc.data() } as Notice);
        });
        if (fetchedNotices.length > 0) {
          setNotices(fetchedNotices);
        }
      } catch (error) {
        console.error("Error fetching notices: ", error);
      }
    };
    fetchNotices();
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAdmin(true);
      setView('ADMIN_DASHBOARD');
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('गलत विवरण। कृपया प्रशासन शाखामा सम्पर्क गर्नुहोस्।');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setView('HOME');
  };

  const renderStaffSection = (title: string, filterCategory?: string) => {
    const filteredStaff = filterCategory ? doctors.filter(d => d.category === filterCategory) : doctors;
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex p-3 bg-blue-50 text-blue-700 rounded-2xl mb-4">
            <Users size={32} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">{title}</h2>
          <p className="text-slate-500 mt-2 font-medium text-sm md:text-base">चौदण्डीगढी नगरपालिका आधारभूत नगर अस्पताल</p>
        </div>
        
        {filteredStaff.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredStaff.map(doc => (
              <div key={doc.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                <div className="relative h-56 md:h-64 overflow-hidden">
                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-base md:text-lg font-black text-white drop-shadow-md">{doc.name}</h3>
                  </div>
                </div>
                <div className="p-6 flex-1 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-slate-600">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Briefcase size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">पद</p>
                        <p className="text-xs md:text-sm font-bold text-slate-900 leading-tight">{doc.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-slate-600">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Layers size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">तह</p>
                        <p className="text-xs md:text-sm font-bold text-slate-900 leading-tight">{doc.level || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-slate-600">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">कार्यरत शाखा</p>
                        <p className="text-xs md:text-sm font-bold text-slate-900 leading-tight">{doc.department || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    <span>उपलब्धता:</span>
                    <span className="text-blue-700">{doc.availability}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 md:p-20 text-center">
            <p className="text-slate-400 italic font-medium text-base md:text-lg">यस विधामा अहिले कुनै विवरण उपलब्ध छैन।</p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return <Home notices={notices} services={services} doctors={doctors} setView={setView} />;
      case 'NOTICES':
        return <Notices notices={notices} />;
      case 'SERVICES':
        return <Services services={services} />;
      case 'DOWNLOADS':
        return <Downloads downloads={downloads} />;
      case 'COMMITTEE':
        return renderStaffSection('स्वास्थ्य संस्था व्यवस्थापन समिति', 'COMMITTEE');
      case 'CHIEFS':
        return renderStaffSection('प्रमुखहरू', 'CHIEF');
      case 'CURRENT_STAFF':
        return renderStaffSection('हाल कार्यरत कर्मचारीहरू', 'STAFF');
      case 'FORMER_STAFF':
        return renderStaffSection('पूर्व कर्मचारीहरू', 'FORMER');
      case 'ABOUT':
        return (
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-8">
             <h2 className="text-3xl md:text-4xl font-black text-slate-900">बेल्टार आधारभूत नगर अस्पतालको बारेमा</h2>
             <div className="prose prose-blue lg:prose-lg max-w-none text-slate-600 font-medium leading-relaxed">
               <p>आधारभूत नगर अस्पताल बेल्टार, चौदण्डीगढी नगरपालिका, उदयपुरको एक प्रमुख स्वास्थ्य संस्था हो। यस अस्पतालको मुख्य लक्ष्य स्थानीय बासिन्दाहरूलाई सुलभ, गुणस्तरीय र प्रभावकारी स्वास्थ्य सेवा प्रदान गर्नु हो।</p>
               <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-8 mb-4">हाम्रो लक्ष्य</h3>
               <p>आधुनिक चिकित्सा प्रविधि र दक्ष जनशक्तिको माध्यमबाट समाजका हरेक वर्गलाई आधारभूत स्वास्थ्य सेवाको पहुँचमा पुर्याउनु नै हाम्रो मुख्य लक्ष्य हो।</p>
               <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-8 mb-4">हाम्रो इतिहास</h3>
               <p>नेपाल सरकारको "एक स्थानीय तह, एक आधारभूत अस्पताल" नीति अनुरुप यस अस्पताललाई स्तरोन्नति गरि नगर अस्पतालको रुपमा संचालन गरिएको हो।</p>
             </div>
          </div>
        );
      case 'ADMIN_LOGIN':
        return (
          <div className="max-w-md mx-auto py-16 md:py-24 px-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
              <div className="bg-blue-800 p-6 md:p-8 text-center text-white">
                <ShieldIcon size={48} className="mx-auto mb-4 opacity-80" />
                <h2 className="text-xl md:text-2xl font-black">प्रशासनिक क्षेत्र</h2>
                <p className="text-xs md:text-sm opacity-70 mt-1">बेल्टार अस्पताल प्रशासनिक लगइन</p>
              </div>
              <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-6">
                {loginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-2">
                    <AlertIcon size={16} /> {loginError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-2">प्रयोगकर्ताको नाम</label>
                    <input 
                      id="username"
                      name="username"
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Username"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-2">पासवर्ड</label>
                    <input 
                      id="password"
                      name="password"
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Password"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-800 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-blue-900 transition-all active:scale-95"><LogInIcon size={20} /> लग-इन गर्नुहोस्</button>
              </form>
            </div>
          </div>
        );
      case 'ADMIN_DASHBOARD':
        return <AdminDashboard notices={notices} services={services} doctors={doctors} downloads={downloads} onLogout={handleLogout} updateNotices={setNotices} updateServices={setServices} updateDoctors={setDoctors} updateDownloads={setDownloads} />;
      default:
        return <Home notices={notices} services={services} doctors={doctors} setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      {view !== 'ADMIN_DASHBOARD' && <Navbar currentView={view} setView={setView} isAdmin={isAdmin} />}
      {view !== 'ADMIN_DASHBOARD' && (
        <div className="bg-blue-900 text-white py-2 overflow-hidden border-b border-blue-800">
          <div className="flex animate-marquee whitespace-nowrap">
            {notices.map((notice, index) => (
              <div key={index} className="flex items-center gap-4 px-8">
                <span className="font-black text-xs uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">सूचना</span>
                <span className="text-sm font-medium">{notice.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <main className="flex-1">{renderContent()}</main>
      {view !== 'ADMIN_DASHBOARD' && <Footer />}
    </div>
  );
};

export default App;
