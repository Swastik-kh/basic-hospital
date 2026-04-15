
import React, { useState, useRef, useEffect } from 'react';
import { Notice, Service, Doctor, DownloadItem, Appointment } from '../types';
import { Plus, Trash2, Pencil, LayoutDashboard, FileText, Users, LogOut, X, UploadCloud, Download, Menu, Briefcase, Layers, UserCircle, Star, FileCheck, AlertCircle, GripVertical, Info, Image as ImageIcon, CalendarCheck, Phone, ShieldCheck } from 'lucide-react';
import { NepaliDatePicker } from '../components/NepaliDatePicker';
import { db } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
};

interface AdminDashboardProps {
  notices: Notice[];
  services: Service[];
  doctors: Doctor[];
  downloads: DownloadItem[];
  appointments: Appointment[];
  onLogout: () => void;
  updateNotices: (n: Notice[]) => void;
  updateServices: (s: Service[]) => void;
  updateDoctors: (d: Doctor[]) => void;
  updateDownloads: (dw: DownloadItem[]) => void;
  updateAppointments: (a: Appointment[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  notices, 
  services, 
  doctors, 
  downloads,
  appointments,
  onLogout, 
  updateNotices,
  updateServices,
  updateDoctors,
  updateDownloads,
  updateAppointments
}) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'services' | 'doctors' | 'downloads' | 'appointments' | 'password'>('notices');
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    setStatusMessage(null);
  }, [activeTab]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handlePasswordChange called");
    if (!auth.currentUser) {
      console.log("No user logged in");
      return;
    }
    try {
      console.log("Attempting reauthentication for:", auth.currentUser.email);
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      console.log("Reauthentication successful, updating password...");
      await updatePassword(auth.currentUser, newPassword);
      console.log("Password update successful");
      setStatusMessage({ type: 'success', text: 'पासवर्ड सफलतापूर्वक परिवर्तन गरियो!' });
      setNewPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      console.error("Error in handlePasswordChange:", error);
      setStatusMessage({ type: 'error', text: `पासवर्ड परिवर्तन गर्न सकिएन: ${error.message || 'त्रुटि भयो'}` });
    }
  };
  
  const refetchData = async () => {
    try {
      const collections = [
        { name: 'notices', setter: updateNotices },
        { name: 'doctors', setter: updateDoctors },
        { name: 'services', setter: updateServices },
        { name: 'downloads', setter: updateDownloads },
        { name: 'appointments', setter: updateAppointments },
      ];
      for (const col of collections) {
        try {
          const querySnapshot = await getDocs(collection(db, col.name));
          const fetchedData: any[] = [];
          querySnapshot.forEach((doc) => {
            fetchedData.push({ id: doc.id, ...doc.data() });
          });
          col.setter(fetchedData);
        } catch (err) {
          throw handleFirestoreError(err, OperationType.LIST, col.name);
        }
      }
    } catch (error) {
      console.error("Error refetching data: ", error);
    }
  };
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noticeFileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  // States for new/editing items
  // Note: We use a temporary placeholder date that will be overwritten by the Nepali Date Picker
  const [newNotice, setNewNotice] = useState({ title: '', content: '', date: '', category: 'General', pdfUrl: '', fileName: '', isMarquee: false });
  const [newService, setNewService] = useState({ name: '', description: '', icon: 'Stethoscope' });
  const [newDoctor, setNewDoctor] = useState({ 
    name: '', specialization: '', level: '', department: '', 
    availability: '', image: '', category: 'STAFF', featuredRole: '' 
  });
  const [newDownload, setNewDownload] = useState({ title: '', category: 'Form', fileUrl: '', fileName: '', date: '' });
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 800KB to stay safe within 1MB Firestore limit)
      if (file.size > 800 * 1024) {
        setStatusMessage({ type: 'error', text: 'फोटो धेरै ठूलो भयो। कृपया ८००KB भन्दा सानो फोटो छान्नुहोस्।' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDoctor({ ...newDoctor, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 800KB)
      if (file.size > 800 * 1024) {
        setStatusMessage({ type: 'error', text: 'फाइल धेरै ठूलो भयो। कृपया ८००KB भन्दा सानो फाइल छान्नुहोस्।' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDownload({ 
          ...newDownload, 
          fileUrl: reader.result as string,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNoticeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 800KB)
      if (file.size > 800 * 1024) {
        setStatusMessage({ type: 'error', text: 'फाइल धेरै ठूलो भयो। कृपया ८००KB भन्दा सानो फाइल छान्नुहोस्।' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNotice({ 
          ...newNotice, 
          pdfUrl: reader.result as string,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const newList = [...doctors];
    const draggedItemContent = newList[dragItem.current];
    newList.splice(dragItem.current, 1);
    newList.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    updateDoctors(newList);
  };

  const handleAddNotice = async () => {
    if (isSaving) return;
    console.log("handleAddNotice called", newNotice);
    if (!newNotice.title || !newNotice.content) {
      console.log("Validation failed: title or content missing");
      setStatusMessage({ type: 'error', text: 'कृपया सूचनाको शीर्षक र विवरण अनिवार्य भर्नुहोस्।' });
      return;
    }
    
    setIsSaving(true);
    setStatusMessage(null);

    const item: any = {
      title: newNotice.title,
      content: newNotice.content,
      date: newNotice.date || new Date().toLocaleDateString('ne-NP').replace(/\//g, '-'),
      category: newNotice.category as any,
      isMarquee: newNotice.isMarquee,
    };
    if (newNotice.pdfUrl.trim()) {
      item.pdfUrl = newNotice.pdfUrl.trim();
    }
    console.log("Attempting to add/update notice to Firestore:", item);
    try {
      if (editingNoticeId) {
        const docRef = doc(db, 'notices', editingNoticeId);
        await updateDoc(docRef, item);
        setStatusMessage({ type: 'success', text: 'सूचना सफलतापूर्वक अपडेट गरियो!' });
      } else {
        await addDoc(collection(db, 'notices'), item);
        setStatusMessage({ type: 'success', text: 'सूचना सफलतापूर्वक सुरक्षित गरियो!' });
      }
      await refetchData();
      setTimeout(() => {
        setIsAdding(false);
        setIsSaving(false);
        setEditingNoticeId(null);
        setStatusMessage(null);
        setNewNotice({ title: '', content: '', date: '', category: 'General', pdfUrl: '', fileName: '', isMarquee: false });
      }, 2500);
    } catch (error) {
      console.error("Error adding/updating notice to Firestore:", error);
      setStatusMessage({ type: 'error', text: `सूचना सुरक्षित गर्दा त्रुटि भयो।` });
      setIsSaving(false);
    }
  };

  const handleAddDownload = async () => {
    if (isSaving) return;
    console.log("handleAddDownload called", newDownload);
    if (!newDownload.title || !newDownload.fileUrl) {
      console.log("Validation failed: title or fileUrl missing");
      setStatusMessage({ type: 'error', text: 'कृपया फाइलको शीर्षक र फाइल अनिवार्य छान्नुहोस्।' });
      return;
    }
    
    setIsSaving(true);
    setStatusMessage(null);

    const item: Omit<DownloadItem, 'id'> = {
      title: newDownload.title,
      category: newDownload.category as any,
      fileUrl: newDownload.fileUrl,
      date: newDownload.date || new Date().toLocaleDateString('ne-NP').replace(/\//g, '-')
    };
    console.log("Attempting to add download to Firestore:", item);
    try {
      try {
        const docRef = await addDoc(collection(db, 'downloads'), item);
        console.log("Download added with ID: ", docRef.id);
      } catch (err) {
        throw handleFirestoreError(err, OperationType.CREATE, 'downloads');
      }
      await refetchData();
      setStatusMessage({ type: 'success', text: 'डाउनलोड फाइल सफलतापूर्वक सुरक्षित गरियो!' });
      setTimeout(() => {
        setIsAdding(false);
        setIsSaving(false);
        setStatusMessage(null);
        setNewDownload({ title: '', category: 'Form', fileUrl: '', fileName: '', date: '' });
      }, 2500);
    } catch (error) {
      console.error("Error adding download: ", error);
      setStatusMessage({ type: 'error', text: 'डाउनलोड फाइल सुरक्षित गर्दा त्रुटि भयो।' });
      setIsSaving(false);
    }
  };

  const handleDeleteDownload = async (id: string) => {
    try {
      try {
        await deleteDoc(doc(db, 'downloads', id));
      } catch (err) {
        throw handleFirestoreError(err, OperationType.DELETE, `downloads/${id}`);
      }
      await refetchData();
    } catch (error) {
      console.error("Error deleting download: ", error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('के तपाईं यो दर्ता हटाउन चाहनुहुन्छ?')) return;
    try {
      try {
        await deleteDoc(doc(db, 'appointments', id));
      } catch (err) {
        throw handleFirestoreError(err, OperationType.DELETE, `appointments/${id}`);
      }
      await refetchData();
    } catch (error) {
      console.error("Error deleting appointment: ", error);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      try {
        await updateDoc(doc(db, 'appointments', id), { status });
      } catch (err) {
        throw handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
      }
      await refetchData();
    } catch (error) {
      console.error("Error updating appointment status: ", error);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      try {
        await deleteDoc(doc(db, 'notices', id));
      } catch (err) {
        throw handleFirestoreError(err, OperationType.DELETE, `notices/${id}`);
      }
      await refetchData();
    } catch (error) {
      console.error("Error deleting notice: ", error);
    }
  };

  const handleAddService = async () => {
    if (isSaving) return;
    console.log("handleAddService called", newService);
    if (!newService.name || !newService.description) {
      console.log("Validation failed: name or description missing");
      return;
    }
    
    setIsSaving(true);
    setStatusMessage(null);

    const item: Omit<Service, 'id'> = {
      name: newService.name,
      description: newService.description,
      icon: newService.icon,
      testRates: []
    };
    console.log("Attempting to add service to Firestore:", item);
    try {
      try {
        const docRef = await addDoc(collection(db, 'services'), item);
        console.log("Service added with ID: ", docRef.id);
      } catch (err) {
        throw handleFirestoreError(err, OperationType.CREATE, 'services');
      }
      await refetchData();
      setStatusMessage({ type: 'success', text: 'सेवा सफलतापूर्वक सुरक्षित गरियो!' });
      setTimeout(() => {
        setIsAdding(false);
        setIsSaving(false);
        setStatusMessage(null);
        setNewService({ name: '', description: '', icon: 'Stethoscope' });
      }, 2500);
    } catch (error) {
      console.error("Error adding service: ", error);
      setStatusMessage({ type: 'error', text: 'सेवा सुरक्षित गर्दा त्रुटि भयो।' });
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (err) {
        throw handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
      }
      await refetchData();
    } catch (error) {
      console.error("Error deleting service: ", error);
    }
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNoticeId(notice.id);
    setStatusMessage(null);
    setNewNotice({
      title: notice.title,
      content: notice.content,
      date: notice.date,
      category: notice.category,
      pdfUrl: notice.pdfUrl || '',
      fileName: '',
      isMarquee: !!notice.isMarquee
    });
    setIsAdding(true);
  };

  const handleAddDoctor = async () => {
    if (isSaving) return;
    console.log("handleAddDoctor called", newDoctor);
    if (!newDoctor.name || !newDoctor.specialization) {
      console.log("Validation failed: name or specialization missing");
      setStatusMessage({ type: 'error', text: 'कृपया कर्मचारीको नाम र पद अनिवार्य भर्नुहोस्।' });
      return;
    }
    
    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (editingDoctorId) {
        console.log("Attempting to update doctor in Firestore:", editingDoctorId, newDoctor);
        const docRef = doc(db, 'doctors', editingDoctorId);
        try {
          await updateDoc(docRef, {
            name: newDoctor.name,
            specialization: newDoctor.specialization,
            level: newDoctor.level,
            department: newDoctor.department,
            availability: newDoctor.availability,
            image: newDoctor.image,
            category: newDoctor.category as any,
            featuredRole: newDoctor.featuredRole || null
          });
        } catch (err) {
          console.error("Firestore update error:", err);
          throw handleFirestoreError(err, OperationType.UPDATE, `doctors/${editingDoctorId}`);
        }
        console.log("Doctor updated successfully");
        await refetchData();
        setStatusMessage({ type: 'success', text: 'कर्मचारी सफलतापूर्वक अपडेट गरियो!' });
      } else {
        console.log("Attempting to add doctor to Firestore:", newDoctor);
        const item: Omit<Doctor, 'id'> = {
          name: newDoctor.name,
          specialization: newDoctor.specialization,
          level: newDoctor.level,
          department: newDoctor.department,
          availability: newDoctor.availability || 'संपर्क गर्नुहोस्',
          image: newDoctor.image || 'https://picsum.photos/seed/doc/400/400',
          category: newDoctor.category as any,
          featuredRole: newDoctor.featuredRole || null
        };
        try {
          const docRef = await addDoc(collection(db, 'doctors'), item);
          console.log("Doctor added with ID: ", docRef.id);
        } catch (err) {
          console.error("Firestore add error:", err);
          throw handleFirestoreError(err, OperationType.CREATE, 'doctors');
        }
        await refetchData();
        setStatusMessage({ type: 'success', text: 'कर्मचारी सफलतापूर्वक थपियो!' });
      }
      setTimeout(() => {
        setIsAdding(false);
        setIsSaving(false);
        setEditingDoctorId(null);
        setStatusMessage(null);
        setNewDoctor({ 
          name: '', specialization: '', level: '', department: '', 
          availability: '', image: '', category: 'STAFF', featuredRole: '' 
        });
      }, 2500);
    } catch (error) {
      console.error("Error adding/updating doctor: ", error);
      setStatusMessage({ type: 'error', text: 'कर्मचारी सुरक्षित गर्दा त्रुटि भयो।' });
      setIsSaving(false);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      try {
        await deleteDoc(doc(db, 'doctors', id));
      } catch (err) {
        throw handleFirestoreError(err, OperationType.DELETE, `doctors/${id}`);
      }
      await refetchData();
    } catch (error) {
      console.error("Error deleting doctor: ", error);
    }
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingDoctorId(null);
    setStatusMessage(null);
    setNewDoctor({ 
      name: '', specialization: '', level: '', department: '', 
      availability: '', image: '', category: 'STAFF', featuredRole: '' 
    });
    setNewNotice({ title: '', content: '', date: '', category: 'General', pdfUrl: '', fileName: '' });
  };

  const navTabs = [
    { id: 'notices', label: 'सूचना', icon: FileText },
    { id: 'services', label: 'सेवा', icon: LayoutDashboard },
    { id: 'doctors', label: 'कर्मचारी', icon: Users },
    { id: 'downloads', label: 'डाउनलोड', icon: Download },
    { id: 'appointments', label: 'अनलाइन दर्ता', icon: CalendarCheck },
    { id: 'password', label: 'पासवर्ड', icon: UserCircle },
  ];

  const renderAddForm = () => {
    if (!isAdding) return null;

    return (
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-blue-100 mb-8 animate-in fade-in slide-in-from-top-4 relative z-30">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-bold">
            {editingDoctorId ? 'सम्पादन गर्नुहोस्: ' : 'थप्नुहोस्: '}
            {activeTab === 'notices' ? 'सूचना' : activeTab === 'services' ? 'सेवा' : activeTab === 'doctors' ? 'कर्मचारी' : 'फाइल'}
          </h4>
          <button onClick={closeForm} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>

        {statusMessage && (
          <div className={`p-4 mb-4 rounded-xl text-sm font-bold ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {statusMessage.text}
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">सूचनाको शीर्षक</label>
              <input 
                type="text" 
                placeholder="उदा: कर्मचारी आवश्यकता सम्बन्धी सूचना" 
                className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-slate-50" 
                value={newNotice.title} 
                onChange={e => {
                  console.log("Title changed:", e.target.value);
                  setNewNotice({...newNotice, title: e.target.value});
                }} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {/* Replaced standard input with NepaliDatePicker */}
               <NepaliDatePicker 
                 label="प्रकाशित मिति (Published Date)"
                 value={newNotice.date}
                 onChange={(val) => setNewNotice({...newNotice, date: val})}
               />

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">सूचनाको वर्ग</label>
                <select className="w-full border p-4 rounded-xl outline-none bg-slate-50 font-bold" value={newNotice.category} onChange={e => setNewNotice({...newNotice, category: e.target.value})}>
                  <option value="General">साधारण (General)</option>
                  <option value="Emergency">आपतकालीन (Emergency)</option>
                  <option value="Vaccination">खोप (Vaccination)</option>
                  <option value="Career">वृत्ति (Career)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">PDF वा फोटो अपलोड (संलग्न कागजात)</label>
              <div 
                onClick={() => noticeFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${newNotice.pdfUrl.startsWith('data:') ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                <input 
                  type="file" 
                  ref={noticeFileInputRef} 
                  onChange={handleNoticeFileUpload} 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                />
                {newNotice.pdfUrl.startsWith('data:') ? (
                  <>
                    {newNotice.pdfUrl.includes('image') ? <ImageIcon className="text-green-600" size={24} /> : <FileCheck className="text-green-600" size={24} />}
                    <div className="text-left flex-1 truncate">
                      <p className="text-xs font-black text-green-700 truncate">{newNotice.fileName || 'संलग्न कागजात'}</p>
                      <p className="text-[10px] text-green-600">अपलोड सफल भयो</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setNewNotice({...newNotice, pdfUrl: '', fileName: ''}); }} className="p-1 hover:bg-green-200 rounded text-green-800">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <UploadCloud className="text-slate-400" size={24} />
                    <span className="text-sm font-bold text-slate-500">फाइल छान्नुहोस् (PDF/JPG)</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isMarquee"
                checked={newNotice.isMarquee}
                onChange={e => setNewNotice({...newNotice, isMarquee: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isMarquee" className="text-sm font-bold text-slate-700">सूचनालाई माथि रिबन (Marquee) मा देखाउने</label>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">सूचनाको विवरण</label>
              <textarea 
                placeholder="यहाँ सूचनाको विस्तृत विवरण लेख्नुहोस्..." 
                className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] bg-slate-50 font-medium" 
                value={newNotice.content} 
                onChange={e => {
                  console.log("Content changed:", e.target.value);
                  setNewNotice({...newNotice, content: e.target.value});
                }} 
              />
            </div>

            {!newNotice.pdfUrl.startsWith('data:') && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">बाहिरी लिङ्क (External URL - ऐच्छिक)</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/notice.pdf" 
                  className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50" 
                  value={newNotice.pdfUrl} 
                  onChange={e => setNewNotice({...newNotice, pdfUrl: e.target.value})} 
                />
              </div>
            )}

            <button onClick={handleAddNotice} disabled={isSaving} className={`bg-blue-600 text-white px-6 py-4 rounded-xl font-black w-full shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSaving ? 'सुरक्षित हुँदै...' : 'सूचना सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        )}

        {activeTab === 'downloads' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">कागजातको शीर्षक</label>
              <input 
                type="text" 
                placeholder="उदा: बिरामी दर्ता फारम" 
                className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                value={newDownload.title} 
                onChange={e => setNewDownload({...newDownload, title: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">कागजातको प्रकार</label>
                <select className="w-full border p-4 rounded-xl outline-none bg-slate-50 font-bold" value={newDownload.category} onChange={e => setNewDownload({...newDownload, category: e.target.value})}>
                  <option value="Form">फारम (Form)</option>
                  <option value="Guideline">निर्देशिका (Guideline)</option>
                  <option value="Report">प्रतिवेदन (Report)</option>
                  <option value="Other">अन्य (Other)</option>
                </select>
              </div>

               {/* Replaced standard input with NepaliDatePicker */}
               <NepaliDatePicker 
                 label="मिति (Date)"
                 value={newDownload.date}
                 onChange={(val) => setNewDownload({...newDownload, date: val})}
               />
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">PC बाट फाइल छान्नुहोस्</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${newDownload.fileUrl ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" 
                  />
                  {newDownload.fileUrl ? (
                    <>
                      <FileCheck className="text-green-600" size={24} />
                      <div className="text-left flex-1 truncate">
                        <p className="text-xs font-black text-green-700 truncate">{newDownload.fileName}</p>
                        <p className="text-[10px] text-green-600">फाइल अपलोड भयो</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setNewDownload({...newDownload, fileUrl: '', fileName: ''}); }} className="p-1 hover:bg-green-200 rounded text-green-800">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-slate-400" size={24} />
                      <span className="text-sm font-bold text-slate-500">फाइल अपलोड गर्नुहोस्</span>
                    </>
                  )}
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <AlertCircle className="text-blue-600 shrink-0" size={18} />
              <p className="text-[10px] md:text-xs text-blue-800 font-medium">तपाईंले यहाँ अपलोड गर्ने फाइल स्थानीय रूपमा सुरक्षित हुनेछ। ठूला फाइलहरूको सट्टा पिडिएफ (PDF) वा इमेज (Image) प्रयोग गर्न सिफारिस गरिन्छ।</p>
            </div>

            <button onClick={handleAddDownload} disabled={isSaving} className={`bg-blue-600 text-white px-6 py-4 rounded-xl font-black w-full shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSaving ? 'सुरक्षित हुँदै...' : 'डाउनलोड फाइल सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-4">
            <input type="text" placeholder="सेवाको नाम" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
            <select className="w-full border p-3 rounded-xl outline-none" value={newService.icon} onChange={e => setNewService({...newService, icon: e.target.value})}>
              <option value="Stethoscope">Stethoscope (OPD)</option>
              <option value="Ambulance">Ambulance (Emergency)</option>
              <option value="Baby">Baby (Maternity)</option>
              <option value="TestTube">TestTube (Lab)</option>
              <option value="Pill">Pill (Pharmacy)</option>
              <option value="Activity">Activity (Radiology)</option>
            </select>
            <textarea placeholder="सेवाको विवरण" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
            <button onClick={handleAddService} disabled={isSaving} className={`bg-blue-600 text-white px-6 py-4 rounded-xl font-black w-full shadow-md hover:bg-blue-700 transition-all active:scale-[0.98] ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSaving ? 'सुरक्षित हुँदै...' : 'सेवा सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">कर्मचारीको पूरा नाम (Full Name)</label>
                 <input 
                   type="text" 
                   placeholder="उदा: डा. रमेश कोइराला" 
                   className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-slate-50" 
                   value={newDoctor.name} 
                   onChange={e => setNewDoctor({...newDoctor, name: e.target.value})} 
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">कर्मचारीको श्रेणी (Category)</label>
                 <select 
                   className="w-full border p-4 rounded-xl outline-none bg-slate-50 font-bold" 
                   value={newDoctor.category} 
                   onChange={e => setNewDoctor({...newDoctor, category: e.target.value})}
                 >
                   <option value="STAFF">हाल कार्यरत कर्मचारी (Current Staff)</option>
                   <option value="CHIEF">प्रमुखहरू (Chiefs/MS)</option>
                   <option value="COMMITTEE">व्यवस्थापन समिति (Management Committee)</option>
                   <option value="FORMER">पूर्व कर्मचारी (Former Staff)</option>
                 </select>
               </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-inner">
               <label className="block text-[11px] font-black text-blue-700 uppercase mb-3 tracking-wider flex items-center gap-2">
                 <Star size={14} /> गृहपृष्ठमा विशेष पद (Featured Role for Home Page)
               </label>
               <select 
                 className="w-full border p-4 rounded-xl outline-none bg-white font-black text-blue-900 shadow-sm" 
                 value={newDoctor.featuredRole} 
                 onChange={e => setNewDoctor({...newDoctor, featuredRole: e.target.value})}
               >
                 <option value="">None (Featured नगर्ने)</option>
                 <option value="CHAIRPERSON">अध्यक्ष (Chairperson Slot)</option>
                 <option value="CHIEF">हालका प्रमुख (Chief Slot)</option>
                 <option value="INFO_OFFICER">सूचना अधिकारी (Info Officer Slot)</option>
               </select>
               <div className="flex items-start gap-2 mt-3">
                 <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-blue-500 font-bold italic">यो फिचरले कर्मचारीलाई वेबसाइटको मुख्य पृष्‍ठको दायाँ साइडबारमा देखाउनेछ।</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">पद (Position/Post)</label>
                <input 
                  type="text" 
                  placeholder="उदा: मेडिकल अधिकृत" 
                  className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold" 
                  value={newDoctor.specialization} 
                  onChange={e => setNewDoctor({...newDoctor, specialization: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">तह (Level)</label>
                <input 
                  type="text" 
                  placeholder="उदा: आठौं / सातौं" 
                  className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold" 
                  value={newDoctor.level} 
                  onChange={e => setNewDoctor({...newDoctor, level: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">शाखा (Department)</label>
                <input 
                  type="text" 
                  placeholder="उदा: ओपिडी / इमर्जेन्सी" 
                  className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold" 
                  value={newDoctor.department} 
                  onChange={e => setNewDoctor({...newDoctor, department: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">उपलब्धता / समय (Availability)</label>
              <input 
                type="text" 
                placeholder="उदा: १०:०० AM - ५:०० PM" 
                className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold" 
                value={newDoctor.availability} 
                onChange={e => setNewDoctor({...newDoctor, availability: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">फोटो अपलोड (Staff Photo)</label>
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 transition-colors bg-slate-50 cursor-pointer group" onClick={() => imageInputRef.current?.click()}>
                <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                {newDoctor.image ? (
                  <div className="relative">
                    <img src={newDoctor.image} alt="Preview" className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-3xl border-4 border-white shadow-xl" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-3xl transition-opacity">
                      <p className="text-white text-xs font-black uppercase">परिवर्तन गर्नुहोस्</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={40} className="text-slate-400 group-hover:text-blue-500 mb-3" />
                    <p className="text-sm font-black text-slate-500 text-center uppercase tracking-widest">यहाँ थिचेर फोटो छान्नुहोस्</p>
                    <p className="text-[10px] text-slate-400 mt-1">सिफारिस गरिएको साइज: ४००x४०० (वर्ग)</p>
                  </>
                )}
              </div>
            </div>
            
            <button onClick={handleAddDoctor} disabled={isSaving} className={`bg-blue-600 text-white px-6 py-5 rounded-2xl font-black w-full shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98] text-lg ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSaving ? 'सुरक्षित हुँदै...' : (editingDoctorId ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'नयाँ कर्मचारी सुरक्षित गर्नुहोस्')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row">
      {/* Sidebar - Desktop */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black tracking-tight">प्रशासन प्यानल</h2>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">बेल्टार नगर अस्पताल</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navTabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any); 
                setIsAdding(false); 
                setSidebarOpen(false); 
                setEditingDoctorId(null);
                setStatusMessage(null);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <tab.icon size={18} /> {tab.label} व्यवस्थापन
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut size={18} /> लग-आउट
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex flex-row justify-between items-center mb-8 gap-4">
            <h3 className="text-2xl font-black text-slate-900">
              {navTabs.find(t => t.id === activeTab)?.label} व्यवस्थापन
            </h3>
            {activeTab !== 'appointments' && (
              <button 
                onClick={() => isAdding ? closeForm() : setIsAdding(true)}
                className="w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                {isAdding ? <><X size={18} /> बन्द गर्नुहोस्</> : <><Plus size={18} /> नयाँ थप्नुहोस्</>}
              </button>
            )}
          </div>

          {renderAddForm()}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-12"></th>
                    <th className="px-6 py-4">
                      {activeTab === 'doctors' ? 'फोटो' : activeTab === 'appointments' ? 'बिरामीको विवरण' : 'शिर्षक / नाम'}
                    </th>
                    {activeTab !== 'doctors' && activeTab !== 'appointments' && <th className="px-6 py-4">वर्ग / विवरण</th>}
                    {activeTab === 'doctors' && <th className="px-6 py-4">नाम</th>}
                    {activeTab === 'doctors' && <th className="px-6 py-4">विवरण</th>}
                    {activeTab === 'appointments' && <th className="px-6 py-4">सेवा र मिति</th>}
                    {activeTab === 'appointments' && <th className="px-6 py-4">अवस्था</th>}
                    <th className="px-6 py-4 text-right">कार्य</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTab === 'appointments' && appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <UserCircle size={18} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{app.patientName}</p>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Phone size={10} /> {app.phoneNumber}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">{app.address}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                            {app.serviceName}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1">
                          <CalendarCheck size={12} className="text-slate-400" /> {app.date}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={app.status}
                          onChange={(e) => handleUpdateAppointmentStatus(app.id, e.target.value as any)}
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border-none outline-none cursor-pointer ${
                            app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            app.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            app.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          <option value="Pending">प्रतीक्षा</option>
                          <option value="Confirmed">निश्चित</option>
                          <option value="Completed">सम्पन्न</option>
                          <option value="Cancelled">रद्द</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteAppointment(app.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'doctors' && doctors.map((doc, index) => (
                    <tr 
                      key={doc.id} 
                      draggable 
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`hover:bg-slate-50 transition-colors group cursor-move ${editingDoctorId === doc.id ? 'bg-blue-50' : 'active:bg-blue-50/50'}`}
                    >
                      <td className="px-6 py-4">
                        <GripVertical size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <img src={doc.image} alt={doc.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          {doc.featuredRole && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full border border-white">
                              <Star size={8} fill="currentColor" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-slate-900 text-sm">{doc.name}</p>
                           {doc.featuredRole && (
                             <span className="bg-yellow-100 text-yellow-700 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                               Featured: {doc.featuredRole === 'CHAIRPERSON' ? 'अध्यक्ष' : doc.featuredRole === 'CHIEF' ? 'प्रमुख' : 'सूचना'}
                             </span>
                           )}
                        </div>
                        <p className="text-[9px] text-blue-600 font-black uppercase tracking-wider">{doc.category}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Briefcase size={12} className="text-slate-400" /> {doc.specialization}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          तह: {doc.level} | शाखा: {doc.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleEditDoctor(doc)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="सम्पादन गर्नुहोस्">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDeleteDoctor(doc.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="हटाउनुहोस्">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {activeTab === 'notices' && notices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{notice.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{notice.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          notice.category === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {notice.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEditNotice(notice)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Pencil size={18} /></button>
                        <button onClick={() => handleDeleteNotice(notice.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'downloads' && downloads.map((dw) => (
                    <tr key={dw.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{dw.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{dw.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">{dw.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteDownload(dw.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  
                  {activeTab === 'services' && services.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">{service.name}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-[200px]">{service.description}</td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button onClick={() => handleDeleteService(service.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'password' && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8">
                        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                          <h3 className="text-lg font-bold text-slate-900 mb-4">पासवर्ड परिवर्तन गर्नुहोस्</h3>
                          {statusMessage && (
                            <div className={`p-4 mb-4 rounded-xl text-sm font-bold ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {statusMessage.text}
                            </div>
                          )}
                          <form onSubmit={handlePasswordChange} className="space-y-4">
                            <input
                              type="password"
                              placeholder="पुरानो पासवर्ड"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              required
                            />
                            <input
                              type="password"
                              placeholder="नयाँ पासवर्ड"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="block w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              required
                            />
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                              पासवर्ड परिवर्तन गर्नुहोस्
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" />}
    </div>
  );
};

export default AdminDashboard;
