
import React, { useState } from 'react';
import { Notice } from '../types';
import { Calendar, Tag, ChevronRight, X, Info, FileDown, FileText } from 'lucide-react';

interface NoticesProps {
  notices: Notice[];
}

const Notices: React.FC<NoticesProps> = ({ notices }) => {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const closeModal = () => setSelectedNotice(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 relative">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">सूचना तथा जानकारी</h2>
        <p className="text-slate-600 font-medium">अस्पतालका नवीनतम सूचना, सार्वजनिक सूचना र कर्मचारी आवश्यकता सम्बन्धी जानकारीहरू यहाँ पाउन सक्नुहुन्छ।</p>
      </div>

      <div className="space-y-6">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div key={notice.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all border-l-8 border-l-blue-600 group">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    notice.category === 'Emergency' ? 'bg-red-100 text-red-700' : 
                    notice.category === 'Vaccination' ? 'bg-green-100 text-green-700' :
                    notice.category === 'Career' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <Tag size={12} />
                    {notice.category === 'General' ? 'साधारण' : notice.category === 'Emergency' ? 'आपतकालीन' : notice.category === 'Vaccination' ? 'खोप' : 'वृत्ति'}
                  </span>
                  <span className="text-sm text-slate-400 font-bold flex items-center gap-1">
                    <Calendar size={14} /> {notice.date}
                  </span>
                </div>
                {notice.pdfUrl && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-orange-200">
                    <FileText size={12} /> PDF उपलब्ध
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-700 transition-colors">{notice.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">{notice.content}</p>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedNotice(notice)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-colors border border-slate-200"
                >
                  विस्तृत जानकारी <ChevronRight size={16} />
                </button>
                {notice.pdfUrl && (
                  <a 
                    href={notice.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileDown size={16} /> PDF डाउनलोड
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-100 rounded-3xl">
            <p className="text-slate-400 italic">अहिले कुनै सूचना उपलब्ध छैन।</p>
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-blue-800 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-tight">सूचनाको विवरण</h3>
                  <p className="text-xs text-blue-200 font-medium">चौदण्डीगढी नगरपालिका स्वास्थ्य शाखा</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-8 bg-white">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                  selectedNotice.category === 'Emergency' ? 'bg-red-100 text-red-700 border border-red-200' : 
                  selectedNotice.category === 'Vaccination' ? 'bg-green-100 text-green-700 border border-green-200' :
                  selectedNotice.category === 'Career' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                  'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {selectedNotice.category === 'General' ? 'साधारण सूचना' : selectedNotice.category === 'Emergency' ? 'आपतकालीन' : selectedNotice.category === 'Vaccination' ? 'खोप अभियान' : 'कर्मचारी आवश्यकता'}
                </span>
                <span className="text-sm text-slate-500 font-bold flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full">
                  <Calendar size={16} /> प्रकाशित मिति: {selectedNotice.date}
                </span>
              </div>

              <h1 className="text-3xl font-black text-slate-900 mb-8 leading-tight border-b-2 border-slate-100 pb-6">
                {selectedNotice.title}
              </h1>

              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                  {selectedNotice.content}
                </p>
              </div>

              {selectedNotice.pdfUrl && (
                <div className="mt-10 p-6 bg-orange-50 rounded-2xl border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-600 text-white p-3 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">संलग्न कागजात उपलब्ध छ</h4>
                      <p className="text-xs text-orange-700 font-bold uppercase tracking-wider">PDF format</p>
                    </div>
                  </div>
                  <a 
                    href={selectedNotice.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <FileDown size={20} /> PDF डाउनलोड गर्नुहोस्
                  </a>
                </div>
              )}

              <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                <Info className="text-blue-600 shrink-0 mt-1" size={20} />
                <div className="text-sm text-blue-800 font-medium leading-relaxed">
                  यस सूचनाको सम्बन्धमा थप जानकारी आवश्यक परेमा अस्पतालको प्रशासन शाखामा कार्यालय समयभित्र सम्पर्क राख्न सकिनेछ।
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50">
              <button 
                onClick={closeModal}
                className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
