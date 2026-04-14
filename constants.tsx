
import { Notice, Service, Doctor, DownloadItem } from './types';

export const INITIAL_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'जेष्ठ नागरिकका लागि नि:शुल्क स्वास्थ्य शिविर',
    date: '२०८१-०२-०७',
    content: 'आगामी शुक्रबार अस्पताल प्राङ्गणमा जेष्ठ नागरिकहरूका लागि नि:शुल्क स्वास्थ्य परीक्षण शिविर आयोजना गरिदैछ। यस शिविरमा सुगर, प्रेसर र आँखाको नि:शुल्क जाँच गरिनेछ।',
    category: 'General',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '2',
    title: 'पोलियो खोप अभियान - दोस्रो चरण',
    date: '२०८१-०२-०२',
    content: 'राष्ट्रिय पोलियो खोप अभियानको दोस्रो चरण आइतबारदेखि सुरु हुँदैछ। आफ्ना बालबालिकालाई नजिकैको खोप केन्द्रमा लैजानुहोला। विस्तृत कार्यतालिका पिडिएफमा हेर्नुहोस्।',
    category: 'Vaccination',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '3',
    title: 'आकस्मिक कक्ष मर्मत सम्बन्धी सूचना',
    date: '२०८१-०१-२८',
    content: 'अस्पतालको आकस्मिक कक्षमा मर्मत कार्य भइरहेको हुनाले, कृपया वैकल्पिक प्रवेशद्वार प्रयोग गर्नुहोला।',
    category: 'Emergency',
  },
];

export const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'ओपिडी सेवा', description: 'साधारण स्वास्थ्य जाँच र विशेषज्ञहरुसँगको परामर्श।', icon: 'Stethoscope' },
  { id: '2', name: '२४ घण्टा आकस्मिक सेवा', description: 'चौबीसै घण्टा उपलब्ध आकस्मिक चिकित्सा सेवा।', icon: 'Ambulance' },
  { id: '3', name: 'प्रसूति सेवा', description: 'सुरक्षित सुत्केरी र नवजात शिशुको हेरचाह।', icon: 'Baby' },
  { 
    id: '4', 
    name: 'प्रयोगशाला (ल्याब)', 
    description: 'पूर्ण सुविधायुक्त आधुनिक प्रयोगशाला सेवा। यहाँ उपलब्ध जाँच र दरहरू हेर्न क्लिक गर्नुहोस्।', 
    icon: 'TestTube',
    testRates: [
      { testName: 'Blood Sugar (F/PP)', price: 'रु. १००' },
      { testName: 'CBC (Complete Blood Count)', price: 'रु. ३००' },
      { testName: 'Lipid Profile', price: 'रु. ६००' },
      { testName: 'Urine RE/ME', price: 'रु. १००' },
      { testName: 'Liver Function Test (LFT)', price: 'रु. ७००' },
      { testName: 'Kidney Function Test (KFT)', price: 'रु. ५००' },
      { testName: 'Blood Grouping', price: 'रु. ५०' },
      { testName: 'Widal Test (Typhoid)', price: 'रु. १५०' },
      { testName: 'HBsAg', price: 'रु. २००' },
      { testName: 'HIV/VDRL', price: 'रु. ३००' },
    ]
  },
  { id: '5', name: 'फार्मेसी', description: 'सरकारी दरमा उपलब्ध औषधि र अत्यावश्यक औषधिहरू।', icon: 'Pill' },
  { id: '6', name: 'रेडियोलोजी (एक्स-रे)', description: 'एक्स-रे र भिडियो एक्स-रे (यूएसजी) सेवा।', icon: 'Activity' },
  { id: '7', name: 'फिजियोथेरापी सेवा', description: 'चोटपटक, पुरानो दुखाइ र पुनर्स्थापनाको लागि आधुनिक फिजियोथेरापी।', icon: 'Accessibility' },
  { id: '8', name: 'दन्त चिकित्सा सेवा', description: 'दाँतको उपचार, सफाइ र मुखको स्वास्थ्य सम्बन्धी परामर्श।', icon: 'Smile' },
];

export const INITIAL_DOCTORS: Doctor[] = [
  { id: '4', name: 'हरि प्रसाद ढुंगाना', specialization: 'अध्यक्ष', level: 'N/A', department: 'व्यवस्थापन समिति', availability: 'अस्पताल परिसर', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', category: 'COMMITTEE', featuredRole: 'CHAIRPERSON' },
  { id: '1', name: 'डा. रमेश कोइराला', specialization: 'निमित्त मेडिकल सुपरिटेन्डेन्ट', level: 'आठौं', department: 'प्रशासन', availability: '१०:०० - ५:००', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400', category: 'CHIEF', featuredRole: 'CHIEF' },
  { id: '10', name: 'नवराज पौडेल', specialization: 'सूचना अधिकारी', level: 'छैठौं', department: 'प्रशासन / सूचना', availability: '१०:०० - ५:००', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', category: 'STAFF', featuredRole: 'INFO_OFFICER' },
  { id: '2', name: 'डा. सुनिता थापा', specialization: 'बाल रोग विशेषज्ञ', level: 'नवौं', department: 'ओपिडी शाखा', availability: 'बिहान ८ - दिउँसो १२', image: 'https://picsum.photos/seed/doc2/400/400', category: 'STAFF' },
  { id: '3', name: 'डा. विकास चौधरी', specialization: 'सर्जन', level: 'नवौं', department: 'शल्यक्रिया शाखा', availability: 'अन-कल', image: 'https://picsum.photos/seed/doc3/400/400', category: 'STAFF' },
];

export const INITIAL_DOWNLOADS: DownloadItem[] = [
  { id: '1', title: 'बिरामी दर्ता फारम (Patient Registration Form)', category: 'Form', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', date: '२०८१/०१/१५' },
  { id: '2', title: 'स्वास्थ्य बिमा सम्बन्धी जानकारी पुस्तिका', category: 'Guideline', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', date: '२०८०/१२/२०' },
  { id: '3', title: 'अस्पतालको वार्षिक प्रगति प्रतिवेदन २०८०/८१', category: 'Report', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', date: '२०८१/०२/०१' },
  { id: '4', title: 'आकस्मिक सेवा कार्यविधि २०८१', category: 'Guideline', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', date: '२०८१/०१/१०' },
];
