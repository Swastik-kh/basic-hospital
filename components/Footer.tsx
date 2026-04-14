
import React from 'react';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-700 pb-10">
          <div>
            <h3 className="text-xl font-bold mb-4">सम्पर्क जानकारी</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-400 mt-1" size={20} />
                <p>बेल्टार, चौदण्डीगढी नगरपालिका, उदयपुर, कोशी प्रदेश, नेपाल</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-blue-400" size={20} />
                <p>+९७७-०३५-XXXXXX</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-blue-400" size={20} />
                <p>info@beltarhospital.gov.np</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">महत्वपूर्ण लिङ्कहरू</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://mohp.gov.np" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={14} /> स्वास्थ्य तथा जनसंख्या मन्त्रालय
                </a>
              </li>
              <li>
                <a 
                  href="https://dohs.gov.np" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={14} /> स्वास्थ्य सेवा विभाग
                </a>
              </li>
              <li>
                <a 
                  href="https://chaudandigadhimun.gov.np" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={14} /> चौदण्डीगढी नगरपालिका
                </a>
              </li>
              <li>
                <a 
                  href="https://edcd.gov.np" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={14} /> इपिडिमियोलोजी तथा रोग नियन्त्रण महाशाखा
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">आपतकालीन सेवा</h3>
            <div className="bg-red-900/40 p-4 rounded-lg border border-red-500/50">
              <p className="text-sm opacity-80 mb-2 font-medium">एम्बुलेन्स सेवा (बेल्टार)</p>
              <p className="text-2xl font-black text-red-500">१०२ / ९८XXXXXXXX</p>
              <p className="text-xs mt-2 italic">* २४ सै घण्टा, ७ सै दिन सेवा उपलब्ध छ।</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} आधारभूत नगर अस्पताल, बेल्टार। सबै अधिकार सुरक्षित।</p>
          <p className="mt-1">जनस्वास्थ्य सचेतना र सेवा प्रवाहका लागि निर्मित।</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
