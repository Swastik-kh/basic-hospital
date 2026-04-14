
import React, { useState } from 'react';
import { DownloadItem } from '../types';
import { FileDown, Search, Filter, FileText, Calendar, Tag } from 'lucide-react';

interface DownloadsProps {
  downloads: DownloadItem[];
}

const Downloads: React.FC<DownloadsProps> = ({ downloads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Form', 'Guideline', 'Report', 'Other'];

  const filteredDownloads = downloads.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">डाउनलोड र फारमहरू</h2>
        <p className="text-slate-600 font-medium">अस्पतालका विभिन्न फारमहरू, प्रतिवेदनहरू र निर्देशिकाहरू यहाँबाट डाउनलोड गर्न सक्नुहुन्छ।</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-12 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="कागजात खोज्नुहोस्..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={18} className="text-slate-400 mr-2 hidden md:block" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? 'सबै' : cat === 'Form' ? 'फारम' : cat === 'Guideline' ? 'निर्देशिका' : cat === 'Report' ? 'प्रतिवेदन' : 'अन्य'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDownloads.length > 0 ? (
          filteredDownloads.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                  <Tag size={12} /> {item.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Calendar size={12} /> {item.date}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-6 group-hover:text-blue-700 transition-colors leading-tight min-h-[3rem]">
                {item.title}
              </h3>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <FileText size={16} /> PDF (1.2 MB)
                </div>
                <a 
                  href={item.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <FileDown size={16} /> डाउनलोड
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">कागजात फेला परेन।</p>
          </div>
        )}
      </div>

      <div className="mt-16 bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center gap-8">
        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg">
          <FileText size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-xl font-black text-slate-900 mb-2">अन्य आवश्यक कागजात चाहिन्छ?</h4>
          <p className="text-slate-600 font-medium">यदि तपाईंले खोजिरहनुभएको फारम यहाँ छैन भने, कृपया अस्पतालको दर्ता शाखामा सम्पर्क गर्नुहोला।</p>
        </div>
        <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-sm whitespace-nowrap shadow-xl">
          सम्पर्क निर्देशिका हेर्नुहोस्
        </button>
      </div>
    </div>
  );
};

export default Downloads;
