
import React, { useState } from 'react';
import { Service, Appointment } from '../types';
import { X, Send, Phone, User, Calendar, MapPin, Info, CheckCircle2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { NepaliDatePicker } from './NepaliDatePicker';
// @ts-ignore
import NepaliDate from 'nepali-date-converter';

interface OnlineRegistrationFormProps {
  services: Service[];
  initialServiceId?: string;
  onClose: () => void;
}

const OnlineRegistrationForm: React.FC<OnlineRegistrationFormProps> = ({ services, initialServiceId, onClose }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    address: '',
    serviceId: initialServiceId || '',
    date: new NepaliDate().format('YYYY-MM-DD')
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [regNumber, setRegNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateRegNumber = () => {
    const year = new NepaliDate().getYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BA-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.phoneNumber || !formData.serviceId || !formData.date) {
      setError('कृपया सबै अनिवार्य क्षेत्रहरू भर्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedService = services.find(s => s.id === formData.serviceId);
      const newRegNumber = generateRegNumber();
      const appointment: Omit<Appointment, 'id'> = {
        patientName: formData.patientName,
        phoneNumber: formData.phoneNumber,
        age: formData.age,
        gender: formData.gender,
        address: formData.address,
        serviceId: formData.serviceId,
        serviceName: selectedService?.name || 'Unknown Service',
        date: formData.date,
        registrationNumber: newRegNumber,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'appointments'), appointment);
      setRegNumber(newRegNumber);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Error submitting registration:", err);
      setError('दर्ता गर्दा समस्या भयो। कृपया फेरि प्रयास गर्नुहोस्।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">दर्ता सफल भयो!</h3>
          <div className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">तपाईंको दर्ता नम्बर (Registration No.)</p>
            <p className="text-3xl font-black text-blue-900 tracking-tight">{regNumber}</p>
          </div>
          <p className="text-slate-600 font-medium mb-6">
            तपाईंको अनलाइन दर्ता सफलतापूर्वक प्राप्त भएको छ। कृपया यो दर्ता नम्बर सुरक्षित राख्नुहोला। अस्पतालबाट तपाईंलाई चाँडै सम्पर्क गरिनेछ।
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 my-8">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black">अनलाइन नाम दर्ता</h3>
            <p className="text-xs text-blue-100 font-medium">कृपया आफ्नो विवरण सही रूपमा भर्नुहोस्</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
              <Info size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> बिरामीको नाम *
              </label>
              <input 
                type="text"
                required
                placeholder="पूरा नाम लेख्नुहोस्"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-bold text-slate-800"
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Phone size={14} /> सम्पर्क नम्बर *
              </label>
              <input 
                type="tel"
                required
                placeholder="मोबाइल नम्बर"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-bold text-slate-800"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">उमेर</label>
              <input 
                type="text"
                placeholder="उदाहरण: २५ वर्ष"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-bold text-slate-800"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">लिङ्ग</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-bold text-slate-800"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
              >
                <option value="Male">पुरुष</option>
                <option value="Female">महिला</option>
                <option value="Other">अन्य</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={14} /> ठेगाना
            </label>
            <input 
              type="text"
              placeholder="गाउँ/नगर, वडा नं."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-bold text-slate-800"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Info size={14} /> सेवा छनोट गर्नुहोस् *
              </label>
              <select 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-bold text-slate-800"
                value={formData.serviceId}
                onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
              >
                <option value="">सेवा छान्नुहोस्</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} /> मिति *
              </label>
              <NepaliDatePicker 
                value={formData.date}
                onChange={(date) => setFormData({...formData, date})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'पठाउँदै...' : (
                <>
                  दर्ता पठाउनुहोस् <Send size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnlineRegistrationForm;
