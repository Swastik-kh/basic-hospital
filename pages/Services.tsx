
import React, { useState } from 'react';
import { Service } from '../types';
import * as Icons from 'lucide-react';

interface ServicesProps {
  services: Service[];
}

const Services: React.FC<ServicesProps> = ({ services }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const closeModal = () => setSelectedService(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 relative">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">हाम्रा स्वास्थ्य सेवाहरू</h2>
        <p className="text-slate-600 max-w-2xl mx-auto font-medium">
          हामी बेल्टारका नागरिकहरूलाई गुणस्तरीय र सुलभ स्वास्थ्य सेवा पुर्याउन प्रतिबद्ध छौं।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => {
          const IconComponent = (Icons as any)[service.icon] || Icons.HelpCircle;
          const hasRates = service.testRates && service.testRates.length > 0;
          
          return (
            <div 
              key={service.id} 
              onClick={() => hasRates && setSelectedService(service)}
              className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all group flex flex-col ${
                hasRates ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 border-blue-100' : 'hover:shadow-md'
              }`}
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <IconComponent size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.name}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">{service.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                {hasRates ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                    <Icons.BadgeInfo size={12} /> दर रेट उपलब्ध
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px] font-bold">थप जानकारीका लागि सम्पर्क गर्नुहोस्</span>
                )}
                
                <button className={`text-blue-600 font-bold text-sm flex items-center gap-1 transition-opacity ${hasRates ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {hasRates ? 'जाँच र दर हेर्नुहोस्' : 'थप जानकारी'} <Icons.ChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Rates Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-blue-800 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  {React.createElement((Icons as any)[selectedService.icon] || Icons.HelpCircle, { size: 24 })}
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-tight">{selectedService.name}</h3>
                  <p className="text-xs text-blue-200 font-medium">उपलब्ध जाँच र स्वीकृत सरकारी दरहरू</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Icons.X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 bg-slate-50">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">जाँचको नाम (Test Name)</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">दर (Price)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedService.testRates?.map((rate, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{rate.testName}</td>
                        <td className="px-6 py-4 text-sm font-black text-blue-700 text-right">{rate.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <Icons.AlertCircle className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  माथि उल्लेखित दरहरू सरकारी नियमानुसार तोकिएको न्यूनतम शुल्क हो। केही विशेष अवस्थामा वा थप सेवा आवश्यक परेमा शुल्कमा सामान्य हेरफेर हुन सक्छ। थप जानकारीका लागि अस्पतालको बिलिङ शाखामा सम्पर्क गर्नुहोला।
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={closeModal}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
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

export default Services;
