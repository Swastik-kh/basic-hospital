
export interface Notice {
  id: string;
  title: string;
  date: string;
  content: string;
  category: 'General' | 'Emergency' | 'Vaccination' | 'Career';
  pdfUrl?: string;
}

export interface TestRate {
  testName: string;
  price: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  testRates?: TestRate[];
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string; // Used as Position/Post
  level: string; // Added Level (तह)
  department: string; // Added Department (शाखा)
  availability: string;
  image: string;
  category?: 'CHIEF' | 'STAFF' | 'COMMITTEE' | 'FORMER';
  featuredRole?: 'CHAIRPERSON' | 'CHIEF' | 'INFO_OFFICER'; // Designated slot for Home Page
}

export interface DownloadItem {
  id: string;
  title: string;
  category: 'Form' | 'Guideline' | 'Report' | 'Other';
  fileUrl: string;
  date: string;
}

export type ViewState = 
  | 'HOME' 
  | 'SERVICES' 
  | 'NOTICES' 
  | 'ABOUT' 
  | 'ADMIN_LOGIN' 
  | 'ADMIN_DASHBOARD'
  | 'COMMITTEE'
  | 'FORMER_STAFF'
  | 'CHIEFS'
  | 'CURRENT_STAFF'
  | 'DOWNLOADS';
