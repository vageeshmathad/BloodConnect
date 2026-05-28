import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Phone, Navigation, User, Search, MapPin, Landmark, 
  Activity, Check, X, ShieldAlert, Compass, RotateCw, Plus, 
  Settings, LogOut, Sun, Moon, AlertTriangle, ArrowRight, Eye, Key, LogIn, Lock, Mail, Award, Calendar, CheckSquare, ChevronDown, Radio, ShieldCheck, MessageSquare, Send, Upload, EyeOff, RefreshCw, Syringe, Building2
} from 'lucide-react';
import InteractiveMap from './components/InteractiveMap';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://bloodconnect-1-noze.onrender.com';

// Seed data with clinical-grade donor profiles
const INITIAL_LOCAL_DONORS = [
  { id: 1, name: 'Amit Patel', bloodGroup: 'O-', phone: '+91 99001 12233', email: 'amit@example.com', password: 'password123', latitude: 12.9730, longitude: 77.5920, isAvailable: true, distance: 0.3, age: 25, city: 'Bengaluru', state: 'Karnataka', lastDonatedDate: '2026-03-01', medicalHistory: 'No chronic diseases', eligibilityFlags: [], consentChecked: true },
  { id: 2, name: 'Priya Nair', bloodGroup: 'A+', phone: '+91 99002 23344', email: 'priya@example.com', password: 'password123', latitude: 12.9790, longitude: 77.6010, isAvailable: true, distance: 1.1, age: 28, city: 'Bengaluru', state: 'Karnataka', lastDonatedDate: '2026-01-15', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true },
  { id: 3, name: 'Vikram Singh', bloodGroup: 'O-', phone: '+91 99003 34455', email: 'vikram@example.com', password: 'password123', latitude: 12.9620, longitude: 77.5910, isAvailable: false, distance: 1.1, age: 34, city: 'Bengaluru', state: 'Karnataka', lastDonatedDate: '2025-12-05', medicalHistory: 'Under medication', eligibilityFlags: [], consentChecked: true },
  { id: 4, name: 'Sarah D\'Souza', bloodGroup: 'B+', phone: '+91 99004 45566', email: 'sarah@example.com', password: 'password123', latitude: 12.9850, longitude: 77.5750, isAvailable: true, distance: 2.6, age: 22, city: 'Bengaluru', state: 'Karnataka', lastDonatedDate: '', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true },
  { id: 5, name: 'Rajesh Kumar', bloodGroup: 'O-', phone: '+91 99005 56677', email: 'rajesh@example.com', password: 'password123', latitude: 12.9510, longitude: 77.6150, isAvailable: true, distance: 3.2, age: 41, city: 'Bengaluru', state: 'Karnataka', lastDonatedDate: '2026-02-28', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true },
  { id: 6, name: 'Kavita Rao', bloodGroup: 'AB-', phone: '+91 99006 67788', email: 'kavita@example.com', password: 'password123', latitude: 13.0150, longitude: 77.6400, isAvailable: true, distance: 6.8, age: 27, city: 'Bengaluru', state: 'Karnataka', lastDonatedDate: '', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true }
];

const INITIAL_LOCAL_BLOOD_BANKS = [
  {
    id: 1,
    name: 'KIMS Blood Bank Hubli',
    contactNumber: '0836-2370000',
    address: 'Vidyanagar, KIMS Hospital Campus, Hubballi',
    latitude: 12.9740,
    longitude: 77.5980,
    inventory: { 'A+': 50, 'A-': 12, 'B+': 35, 'B-': 8, 'AB+': 15, 'AB-': 4, 'O+': 55, 'O-': 5 },
    availableBags: 5,
    distance: 0.45
  },
  {
    id: 2,
    name: 'Hubli Lions Blood Bank',
    contactNumber: '0836-2362525',
    address: 'Vivekanand General Hospital Compound, Deshpande Nagar, Hubballi',
    latitude: 12.9650,
    longitude: 77.5870,
    inventory: { 'A+': 15, 'A-': 2, 'B+': 18, 'B-': 6, 'AB+': 8, 'AB-': 2, 'O+': 20, 'O-': 15 },
    availableBags: 15,
    distance: 1.1
  },
  {
    id: 3,
    name: 'Sha Damji Jadavji Chheda Memorial Rashtrotthana Blood Centre',
    contactNumber: '0836-2215657',
    address: 'D.J. Building, Neeligin Road, New Cotton Market, Hubballi',
    latitude: 13.0020,
    longitude: 77.6200,
    inventory: { 'A+': 35, 'A-': 6, 'B+': 39, 'B-': 8, 'AB+': 6, 'AB-': 1, 'O+': 53, 'O-': 35 },
    availableBags: 35,
    distance: 4.4
  },
  {
    id: 4,
    name: 'Prema Bindu Blood Bank',
    contactNumber: '0836-2374422',
    address: 'Sukruth Building, Opposite KC Park Main Gate, Near Panjuri Hotel, Dharwad',
    latitude: 12.9100,
    longitude: 77.5200,
    inventory: { 'A+': 25, 'A-': 4, 'B+': 12, 'B-': 4, 'AB+': 4, 'AB-': 0, 'O+': 30, 'O-': 25 },
    availableBags: 25,
    distance: 10.5
  }
];

// Medically Compatible Blood Type Matcher
const GET_COMPATIBLE_TYPES = (group) => {
  switch (group) {
    case 'O-': return ['O-'];
    case 'O+': return ['O-', 'O+'];
    case 'A-': return ['O-', 'A-'];
    case 'A+': return ['O-', 'O+', 'A-', 'A+'];
    case 'B-': return ['O-', 'B-'];
    case 'B+': return ['O-', 'O+', 'B-', 'B+'];
    case 'AB-': return ['O-', 'A-', 'B-', 'AB-'];
    case 'AB+': return ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    default: return [];
  }
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true); // default dark theme as requested

  // --- Auth Session States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'patient', 'donor', 'blood_bank', 'admin'
  const [authMode, setAuthMode] = useState('select'); // 'select', 'login', 'register'
  const [activeLoginType, setActiveLoginType] = useState('patient'); // 'patient', 'donor', 'blood_bank', 'admin'
  const [oneBloodId, setOneBloodId] = useState('OB-782910');

  // --- Form inputs for onboarding ---
  const [signUpForm, setSignUpForm] = useState({
    name: '', email: '', phone: '', city: 'Bengaluru', password: ''
  });

  // --- Validation Errors ---
  const [validationErrors, setValidationErrors] = useState({});

  // --- Network Connection State ---
  const [serverOnline, setServerOnline] = useState(false);
  const [dbModeStr, setDbModeStr] = useState('MongoDB Cloud');
  const [checkingHealth, setCheckingHealth] = useState(true);

  // --- Coordinates center ---
  const [userLocation, setUserLocation] = useState({ latitude: 12.9650, longitude: 77.5870 }); // Default centered around Hubballi
  const [locationName, setLocationName] = useState('Hubballi Node');

  // --- Search parameters ---
  const [searchBloodGroup, setSearchBloodGroup] = useState('O-');
  const [searchRadius, setSearchRadius] = useState(25);
  const [searchType, setSearchType] = useState('all'); // 'all', 'banks', 'donors'
  const [searchMethod, setSearchMethod] = useState('smart'); // 'smart' (AI OCR), 'manual'
  
  // --- Search results lists ---
  const [resultsDonors, setResultsDonors] = useState([]);
  const [resultsBanks, setResultsBanks] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedResultCard, setSelectedResultCard] = useState(null);

  // --- Simulated chat console ---
  const [openChatRoom, setOpenChatRoom] = useState(null); // hold matching partner details
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");

  // --- AI OCR Prescription Upload State ---
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrParsedData, setOcrParsedData] = useState(null);

  // --- Active emergency requests queue (simulated WebSocket broadcasts) ---
  const [activeRequests, setActiveRequests] = useState([]);
  const [dispatchAlert, setDispatchAlert] = useState(null);

  // --- Voluntary Donor Registration Wizard State ---
  const [registrationStep, setRegistrationStep] = useState(1); // Steps: 1, 2, 3
  const [donorRegisterForm, setDonorRegisterForm] = useState({
    name: '',
    bloodGroup: 'O-',
    phone: '',
    email: '',
    password: '',
    latitude: '',
    longitude: '',
    age: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    lastDonatedDate: '',
    medicalHistory: '',
    eligibilityFlags: [],
    consentChecked: false,
    isAvailable: true
  });
  
  // Collapsible toggle for eligibility questionnaire
  const [questionnaireCollapsed, setQuestionnaireCollapsed] = useState(true);

  // --- Donor Auth States ---
  const [loggedInDonor, setLoggedInDonor] = useState(null);
  const [donorLoginForm, setDonorLoginForm] = useState({ email: '', password: '' });
  const [donorLoginError, setDonorLoginError] = useState('');
  const [donorLoading, setDonorLoading] = useState(false);

  // --- Admin Auth State ---
  const [adminLoginForm, setAdminLoginForm] = useState({ email: '', password: '' });
  const [adminLoginError, setAdminLoginError] = useState('');

  // --- Admin Desk States ---
  const [adminSelectedBank, setAdminSelectedBank] = useState(null);
  const [showAddBankPanel, setShowAddBankPanel] = useState(false);
  const [adminStatsSpinning, setAdminStatsSpinning] = useState(false);
  
  // --- Admin Blood Bank Creation ---
  const [newBankForm, setNewBankForm] = useState({
    name: '',
    contactNumber: '',
    address: '',
    latitude: '',
    longitude: '',
    inventory: { 'A+': 10, 'A-': 5, 'B+': 10, 'B-': 5, 'AB+': 5, 'AB-': 2, 'O+': 15, 'O-': 8 }
  });

  // --- Toast alert ---
  const [toast, setToast] = useState(null);

  // --- In-Memory Local Backups ---
  const [localDonors, setLocalDonors] = useState(INITIAL_LOCAL_DONORS);
  const [localBanks, setLocalBanks] = useState(INITIAL_LOCAL_BLOOD_BANKS);

  // --- Simulated Active Dispatch Radar logs ---
  const [radarLogs, setRadarLogs] = useState([
    { id: 1, text: "O- Negative emergency dispatch active near Hubballi", time: "Just now", type: "match" },
    { id: 2, text: "Donor Amit Patel unlocked contact for coordination", time: "3m ago", type: "active" },
    { id: 3, text: "KIMS Blood Bank Hubli inventory modified", time: "8m ago", type: "bank" }
  ]);

  // Rotate simulated radar activity logs periodically
  useEffect(() => {
    const logs = [
      "O- emergency coordinate search centered near Hubballi Node",
      "Live Voluntary Donor logged in sector Bengaluru central",
      "KIMS Emergency Center dispatch locked target radius O-",
      "Hospital inventory levels updated at Hubli Lions Repository",
      "Donor Priya Nair unlocked coordination channel",
      "Coordinate map beacon re-calibrated Dharwad grid sector"
    ];
    const interval = setInterval(() => {
      const randomText = logs[Math.floor(Math.random() * logs.length)];
      setRadarLogs(prev => [
        { id: Date.now(), text: randomText, time: "Just now", type: "radar" },
        ...prev.slice(0, 2)
      ]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Sync Dark/Light theme class on document
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [darkMode]);

  // Ping Backend Health status on boot
  const verifyBackendStatus = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch(`${API_BASE_URL}/`);
      if (res.ok) {
        const data = await res.json();
        setServerOnline(true);
        setDbModeStr(data.databaseMode === 'mongodb' ? 'MongoDB Atlas' : 'SQLite3 Failover');
      } else {
        setServerOnline(false);
        setDbModeStr('MongoDB Cloud (Local Sandbox)');
      }
    } catch (e) {
      setServerOnline(false);
      setDbModeStr('MongoDB Cloud (Local Sandbox)');
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    verifyBackendStatus();
  }, []);

  // Show Toast
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // GPS locator simulator
  const simulateGPSLocation = () => {
    if (navigator.geolocation) {
      triggerToast("Querying GPS coordinates...", "info");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ latitude: lat, longitude: lng });
          setLocationName("Active GPS Coordinates");
          triggerToast("Location coordinates synced!", "success");
        },
        (error) => {
          triggerToast("GPS access blocked. Defaulting to Bangalore center.", "warning");
          setUserLocation({ latitude: 12.9716, longitude: 77.5946 });
          setLocationName("Bengaluru Center");
        }
      );
    }
  };

  const presetLocation = (name, lat, lng) => {
    setUserLocation({ latitude: lat, longitude: lng });
    setLocationName(name);
    triggerToast(`Switched center coordinates to: ${name}`, "info");
  };

  // Distance helper
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // CORE SEARCH QUERY FUNCTION
  const executeSearch = async () => {
    setSearching(true);
    
    if (serverOnline) {
      try {
        const queryUrl = `${API_BASE_URL}/api/blood/search?bloodGroup=${encodeURIComponent(searchBloodGroup)}&radius=${searchRadius}&latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
        const response = await fetch(queryUrl);
        const data = await response.json();
        
        if (data.success) {
          setResultsDonors(data.results.donors || []);
          setResultsBanks(data.results.bloodBanks || []);
        } else {
          executeLocalFallbackSearch();
        }
      } catch (err) {
        executeLocalFallbackSearch();
      } finally {
        setSearching(false);
      }
    } else {
      setTimeout(() => {
        executeLocalFallbackSearch();
        setSearching(false);
      }, 150);
    }
  };

  const executeLocalFallbackSearch = () => {
    const matchedDonors = localDonors.map(d => {
      const dist = calculateDistance(userLocation.latitude, userLocation.longitude, d.latitude, d.longitude);
      return { ...d, distance: parseFloat(dist.toFixed(2)), locked: true }; // locked contacts by default for seeker
    }).filter(d => d.bloodGroup === searchBloodGroup && d.isAvailable && d.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    const matchedBanks = localBanks.map(b => {
      const dist = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
      const bags = b.inventory[searchBloodGroup] || 0;
      return { ...b, distance: parseFloat(dist.toFixed(2)), availableBags: bags };
    }).filter(b => b.availableBags > 0 && b.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    setResultsDonors(matchedDonors);
    setResultsBanks(matchedBanks);
  };

  useEffect(() => {
    if (isLoggedIn && userRole === 'patient') {
      executeSearch();
    }
  }, [searchBloodGroup, searchRadius, userLocation, localDonors, localBanks, isLoggedIn, userRole]);

  // validators
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.toLowerCase());
  };

  const validatePhone = (phone) => {
    const clean = phone.replace(/[\s-()]/g, '');
    return clean.length === 10 && /^\d+$/.test(clean);
  };

  // Toggle eligibility checked diseases
  const handleCheckboxChange = (disease) => {
    const currentFlags = [...donorRegisterForm.eligibilityFlags];
    if (currentFlags.includes(disease)) {
      setDonorRegisterForm({
        ...donorRegisterForm,
        eligibilityFlags: currentFlags.filter(item => item !== disease)
      });
    } else {
      setDonorRegisterForm({
        ...donorRegisterForm,
        eligibilityFlags: [...currentFlags, disease]
      });
    }
  };

  // Stepped Form navigation validation checks - Restructured Steps
  const handleWizardNext = () => {
    const errors = {};
    if (registrationStep === 1) {
      if (!donorRegisterForm.name.trim()) errors.name = "Full Name is required.";
      if (!donorRegisterForm.age) {
        errors.age = "Age is required.";
      } else if (parseInt(donorRegisterForm.age) < 18) {
        errors.age = "Age must be at least 18 to donate blood.";
      }
      if (!validatePhone(donorRegisterForm.phone)) errors.phone = "Must be a 10-digit mobile number.";
    } else if (registrationStep === 2) {
      if (!donorRegisterForm.city.trim()) errors.city = "City is required.";
      if (!donorRegisterForm.state.trim()) errors.state = "State is required.";
      if (!validateEmail(donorRegisterForm.email)) errors.email = "Enter a valid email address.";
      if (donorRegisterForm.password.length < 6) errors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      triggerToast("Please review required fields.", "error");
      return;
    }

    setValidationErrors({});
    setRegistrationStep(prev => prev + 1);
  };

  const handleWizardBack = () => {
    setValidationErrors({});
    setRegistrationStep(prev => prev - 1);
  };

  // DONOR REGISTRATION
  const handleDonorRegister = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!donorRegisterForm.consentChecked) errors.consent = "You must consent to be contacted in emergencies.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      triggerToast("Consent confirmation required.", "error");
      return;
    }

    setValidationErrors({});
    const lat = donorRegisterForm.latitude ? parseFloat(donorRegisterForm.latitude) : 12.9716 + (Math.random() - 0.5) * 0.12;
    const lng = donorRegisterForm.longitude ? parseFloat(donorRegisterForm.longitude) : 77.5946 + (Math.random() - 0.5) * 0.12;

    const payload = { 
      ...donorRegisterForm, 
      latitude: lat, 
      longitude: lng 
    };

    registerDonorLocally(payload);
  };

  const registerDonorLocally = (payload) => {
    const newDonor = {
      id: localDonors.length + 1,
      name: payload.name,
      bloodGroup: payload.bloodGroup,
      phone: '+91 ' + payload.phone,
      email: payload.email.toLowerCase(),
      password: payload.password,
      latitude: payload.latitude,
      longitude: payload.longitude,
      isAvailable: payload.isAvailable,
      age: parseInt(payload.age),
      city: payload.city,
      state: payload.state,
      lastDonatedDate: payload.lastDonatedDate || '',
      medicalHistory: payload.medicalHistory || 'None',
      eligibilityFlags: payload.eligibilityFlags,
      consentChecked: payload.consentChecked,
      distance: parseFloat(calculateDistance(userLocation.latitude, userLocation.longitude, payload.latitude, payload.longitude).toFixed(2))
    };
    setLocalDonors(prev => [...prev, newDonor]);
    setLoggedInDonor(newDonor);
    setUserRole('donor');
    setIsLoggedIn(true);
    setOneBloodId('OB-' + Math.floor(100000 + Math.random() * 900000));
    triggerToast(`Donor profile successfully registered!`, "success");
    // reset form
    setDonorRegisterForm({
      name: '', bloodGroup: 'O-', phone: '', email: '', password: '', latitude: '', longitude: '',
      age: '', city: 'Bengaluru', state: 'Karnataka', lastDonatedDate: '', medicalHistory: '', eligibilityFlags: [], consentChecked: false, isAvailable: true
    });
    setRegistrationStep(1);
    setQuestionnaireCollapsed(true);
  };

  // MOCK LOGINS
  const handleDonorLogin = (e) => {
    e.preventDefault();
    setDonorLoading(true);
    setDonorLoginError('');

    if (!validateEmail(donorLoginForm.email)) {
      setDonorLoginError("Please enter a valid email format.");
      setDonorLoading(false);
      return;
    }

    setTimeout(() => {
      const check = localDonors.find(d => d.email.toLowerCase() === donorLoginForm.email.toLowerCase() && d.password === donorLoginForm.password);
      if (check) {
        setLoggedInDonor(check);
        setUserRole('donor');
        setIsLoggedIn(true);
        setOneBloodId('OB-' + Math.floor(100000 + Math.random() * 900000));
        triggerToast(`Welcome back, ${check.name}!`, "success");
        setDonorLoginForm({ email: '', password: '' });
      } else {
        setDonorLoginError("Invalid email or password.");
      }
      setDonorLoading(false);
    }, 500);
  };

  // PATIENT / SEEKER REGISTER
  const handlePatientRegister = (e) => {
    e.preventDefault();
    const errors = {};
    if (!signUpForm.name.trim()) errors.name = "Full name required.";
    if (!validateEmail(signUpForm.email)) errors.email = "Valid email required.";
    if (!validatePhone(signUpForm.phone)) errors.phone = "Must be a 10-digit mobile number.";
    if (signUpForm.password.length < 6) errors.password = "Min 6 characters.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      triggerToast("Please review required fields.", "error");
      return;
    }

    setValidationErrors({});
    setUserRole('patient');
    setIsLoggedIn(true);
    setOneBloodId('OB-' + Math.floor(100000 + Math.random() * 900000));
    triggerToast(`Welcome to OneBlood, ${signUpForm.name}!`, "success");
  };

  // ADMIN LOGIN
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminLoginError('');
    
    if (!validateEmail(adminLoginForm.email)) {
      setAdminLoginError("Please enter a valid email address.");
      return;
    }

    if (adminLoginForm.email.toLowerCase() === 'admin@oneblood.org' && adminLoginForm.password === 'admin123') {
      setUserRole('admin');
      setIsLoggedIn(true);
      setOneBloodId('OB-ADM1N1');
      triggerToast("Admin portal authorized successfully.", "success");
      setAdminLoginForm({ email: '', password: '' });
    } else {
      setAdminLoginError("Invalid administrator credentials.");
    }
  };

  // DEMO CREDENTIAL QUICK LOGINS
  const triggerDonorAutofill = () => {
    setDonorLoginForm({ email: 'amit@example.com', password: 'password123' });
    triggerToast("Donor credentials loaded.", "info");
  };

  const triggerAdminAutofill = () => {
    setAdminLoginForm({ email: 'admin@oneblood.org', password: 'admin123' });
    triggerToast("Admin credentials loaded.", "info");
  };

  const toggleAvailability = () => {
    if (!loggedInDonor) return;
    const targetStatus = !loggedInDonor.isAvailable;
    setLocalDonors(prev => prev.map(d => {
      if (d.email.toLowerCase() === loggedInDonor.email.toLowerCase()) {
        return { ...d, isAvailable: targetStatus };
      }
      return d;
    }));
    setLoggedInDonor(prev => ({ ...prev, isAvailable: targetStatus }));
    triggerToast(`Availability toggled: ${targetStatus ? 'ACTIVE' : 'OFFLINE'}`, "success");
  };

  // ADMIN REGISTER BANK
  const handleBankRegister = (e) => {
    e.preventDefault();
    const errors = {};

    if (!newBankForm.name.trim()) errors.bankName = "Hospital Name is required.";
    if (!newBankForm.address.trim()) errors.bankAddress = "Address is required.";
    if (!validatePhone(newBankForm.contactNumber)) errors.bankPhone = "Please enter a valid phone number.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      triggerToast("Please review hospital fields.", "error");
      return;
    }

    setValidationErrors({});
    const lat = newBankForm.latitude ? parseFloat(newBankForm.latitude) : 12.9716 + (Math.random() - 0.5) * 0.12;
    const lng = newBankForm.longitude ? parseFloat(newBankForm.longitude) : 77.5946 + (Math.random() - 0.5) * 0.12;
    
    const payload = { ...newBankForm, latitude: lat, longitude: lng };
    registerBankLocally(payload);
  };

  const registerBankLocally = (payload) => {
    const newBank = {
      id: localBanks.length + 1,
      name: payload.name,
      contactNumber: payload.contactNumber,
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
      inventory: payload.inventory,
      availableBags: payload.inventory[searchBloodGroup] || 0,
      distance: parseFloat(calculateDistance(userLocation.latitude, userLocation.longitude, payload.latitude, payload.longitude).toFixed(2))
    };
    setLocalBanks(prev => [...prev, newBank]);
    triggerToast(`Registered blood bank: ${payload.name}`, "success");
    setNewBankForm({
      name: '', contactNumber: '', address: '', latitude: '', longitude: '',
      inventory: { 'A+': 10, 'A-': 5, 'B+': 10, 'B-': 5, 'AB+': 5, 'AB-': 2, 'O+': 15, 'O-': 8 }
    });
    setShowAddBankPanel(false);
  };

  const handleUpdateInventory = (group, action) => {
    if (!adminSelectedBank) return;
    const updatedInventory = { ...adminSelectedBank.inventory };
    const currentVal = updatedInventory[group] || 0;
    
    if (action === 'inc') {
      updatedInventory[group] = currentVal + 1;
    } else if (action === 'dec') {
      updatedInventory[group] = Math.max(0, currentVal - 1);
    }
    updateInventoryLocally(updatedInventory);
  };

  const updateInventoryLocally = (updatedInv) => {
    setLocalBanks(prev => prev.map(b => {
      if (b.id === adminSelectedBank.id) {
        return { ...b, inventory: updatedInv, availableBags: updatedInv[searchBloodGroup] || 0 };
      }
      return b;
    }));
    setAdminSelectedBank(prev => ({ ...prev, inventory: updatedInv }));
    triggerToast("Inventory modified successfully.", "success");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setLoggedInDonor(null);
    setAuthMode('select');
    setSelectedResultCard(null);
    setAdminSelectedBank(null);
    setOcrSuccess(false);
    setUploadedFile(null);
    setOpenChatRoom(null);
    triggerToast("Signed out successfully.", "info");
  };

  // --- Smart AI OCR Upload Simulator ---
  const handleOcrFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setOcrScanning(true);
    setOcrSuccess(false);

    // Simulate AI scan delay
    setTimeout(() => {
      setOcrScanning(false);
      setOcrSuccess(true);
      setOcrParsedData({
        patientName: "Sunita Patil",
        bloodGroup: "O-",
        hospitalName: "Hubli Lions Blood Bank",
        licenseNumber: "MCI-48291",
        confidence: 98
      });
      setSearchBloodGroup("O-");
      presetLocation("Hubballi Node", 12.9650, 77.5870); // preset to Hubballi coordinate center
      triggerToast("Claude AI Verification: Legitimate Requisition Letter Confirmed!", "success");
    }, 1800);
  };

  // --- Dynamic Proximity Dispatch Broadcasting ---
  const triggerProximityBroadcast = () => {
    triggerToast("Emitting WebSocket coordinate proximity dispatches...", "info");
    
    // Simulate radial dispatch notification
    setTimeout(() => {
      setDispatchAlert({
        requestId: "REQ-" + Math.floor(10000 + Math.random() * 90000),
        bloodGroup: searchBloodGroup,
        radius: searchRadius,
        matchingDonorsCount: resultsDonors.length,
        receivingHospital: "Hubli Lions Blood Bank"
      });
      
      // Auto donor acceptance loop simulator
      setTimeout(() => {
        if (resultsDonors.length > 0) {
          const match = resultsDonors[0];
          // Unlock profile contact details
          setResultsDonors(prev => prev.map(d => {
            if (d.id === match.id) return { ...d, locked: false };
            return d;
          }));
          
          triggerToast(`Emergency Dispatch accepted by Donor ${match.name}! Contacts unlocked!`, "success");
          
          // Open instant chat coordination terminal
          setOpenChatRoom({
            oneBloodId: match.oneBloodId || "OB-849120",
            name: match.name,
            phone: match.phone,
            bloodGroup: match.bloodGroup,
            distance: match.distance
          });
          
          setChatMessages([
            { id: 1, text: `OneBlood Secure Coordination established for ${searchBloodGroup} Emergency.`, isSystem: true },
            { id: 2, text: `Donor ${match.name} has joined the room. Contact number unlocked!`, isSystem: true }
          ]);
        }
      }, 2000);

    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !openChatRoom) return;

    const userMsg = { id: Date.now(), text: typedMessage, sender: 'me' };
    setChatMessages(prev => [...prev, userMsg]);
    setTypedMessage("");

    // Simulate donor typing response after 2 seconds
    setTimeout(() => {
      const responseMsg = { 
        id: Date.now() + 1, 
        text: `Got it! I am starting my vehicle. I'll reach ${openChatRoom.distance < 2 ? 'there' : 'the center'} within 15 minutes. Keep the files ready.`, 
        sender: 'partner' 
      };
      setChatMessages(prev => [...prev, responseMsg]);
    }, 1800);
  };

  // --- Admin Dashboard Stats Ticker Refresher ---
  const handleAdminStatsRefresh = () => {
    setAdminStatsSpinning(true);
    triggerToast("Syncing database replica streams...", "info");
    setTimeout(() => {
      setAdminStatsSpinning(false);
      triggerToast("System metrics updated successfully!", "success");
    }, 1200);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode ? 'bg-[#090D16] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* 1. Global Glassmorphic Header */}
      <header className="sticky top-0 z-45 bg-[#090D16]/90 border-b border-slate-850 shadow-sm backdrop-blur-md transition-colors select-none">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <button 
            onClick={() => {
              setIsLoggedIn(false);
              setUserRole(null);
              setAuthMode('select');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group text-left cursor-pointer bg-transparent border-0 outline-none">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-red-650 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-all">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                OneBlood
              </span>
              <span className="hidden md:inline-block ml-2 text-[9px] font-black uppercase text-red-450 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded font-mono">
                SECURE NETWORK v2.4
              </span>
            </div>
          </button>

          {/* Center public headers */}
          {!isLoggedIn && (
            <div className="hidden md:flex gap-5 text-xs font-bold text-slate-300">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer">Home</button>
              <button className="hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1">📋 Notice Board</button>
              <button className="hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer">How It Works</button>
            </div>
          )}

          {/* Right Panel Header Roles */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* Unified Role Switcher Selector Dropdown */}
                <div className="relative group">
                  <button className="text-xs bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 text-slate-200 cursor-pointer shadow-sm">
                    <Activity className="w-3.5 h-3.5 text-red-500" />
                    <span>Role: <b className="capitalize text-red-500 font-extrabold">{userRole === 'patient' ? 'Seeker' : userRole === 'blood_bank' ? 'Blood Bank' : userRole}</b></span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-1.5 w-48 bg-[#111625] border border-slate-800 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50 font-sans">
                    {[
                      { role: 'patient', label: '🩺 Seeker (Patient)' },
                      { role: 'donor', label: '🩸 Voluntary Donor' },
                      { role: 'blood_bank', label: '🏦 Blood Bank stock' },
                      { role: 'admin', label: '🛡️ Admin Board' }
                    ].map((item) => (
                      <button
                        key={item.role}
                        onClick={() => {
                          setUserRole(item.role);
                          if (item.role === 'donor' && !loggedInDonor) {
                            setLoggedInDonor(localDonors[0]);
                          }
                          triggerToast(`Switched to ${item.label} Dashboard`, "success");
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-850 text-slate-250 cursor-pointer border-none bg-transparent">
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 font-mono">
                  ID: <span className="text-red-500 dark:text-red-400 font-black">{oneBloodId}</span>
                </span>

                <button 
                  onClick={handleLogout}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-red-500/10 transition-all cursor-pointer border-none">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setAuthMode('login');
                    setActiveLoginType('donor');
                  }}
                  className="text-xs bg-transparent border border-slate-800 font-extrabold px-3.5 py-2 rounded-lg text-slate-200 hover:border-slate-350 cursor-pointer">
                  Login
                </button>
                <button 
                  onClick={() => {
                    setAuthMode('register');
                    setActiveLoginType('patient');
                  }}
                  className="text-xs bg-red-650 hover:bg-red-700 text-white font-extrabold px-3.5 py-2 rounded-lg shadow-md shadow-red-500/15 cursor-pointer border-none">
                  Sign Up
                </button>
              </div>
            )}

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-8.5 h-8.5 rounded-lg border border-slate-800 text-slate-500 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer bg-transparent">
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Global Toast Alerts */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-xl flex items-center gap-2.5 max-w-sm animate-in slide-in-from-bottom-5 duration-200 bg-[#111625] border-slate-800 transition-colors">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 animate-ping ${
            toast.type === 'error' ? 'bg-red-500' : toast.type === 'warning' ? 'bg-amber-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
          }`} />
          <p className="text-xs font-bold text-slate-200 leading-normal font-sans">{toast.message}</p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🚀 ENTRY STATE: ELITE VISUAL ONBOARDING & CHOICE PATHS */}
      {/* ======================================================== */}
      {!isLoggedIn ? (
        <div className="space-y-16 py-12 animate-in fade-in duration-300">
          
          <div className="max-w-6xl mx-auto px-4">
            {authMode === 'select' && (
              <div className="max-w-2xl mx-auto bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
                
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shadow-inner">
                    <Heart className="w-6 h-6 fill-red-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight">Join OneBlood</h1>
                  <p className="text-xs text-slate-400 font-medium">Let's start with a simple question to get you to the right place.</p>
                </div>

                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">— ARE YOU A DONOR, OR ARE YOU LOOKING FOR ONE? —</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  
                  {/* Option A: I want to donate */}
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setActiveLoginType('donor');
                    }}
                    className="bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800 hover:border-red-500/30 p-6 rounded-2xl text-left transition-all group cursor-pointer h-full flex flex-col justify-between select-none border-none">
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform mb-4">
                        <Heart className="w-5 h-5 fill-red-500" />
                      </div>
                      <h3 className="font-display font-bold text-base text-white">I want to donate</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-medium">
                        Help someone in need. Register as a voluntary donor and save lives when it counts.
                      </p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-[10.5px] font-black rounded-lg text-slate-300 font-mono tracking-wide group-hover:text-red-400 group-hover:bg-red-500/10">
                      I'm a Donor ➔
                    </span>
                  </button>

                  {/* Option B: I'm looking for blood */}
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setActiveLoginType('patient');
                    }}
                    className="bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800 hover:border-red-500/30 p-6 rounded-2xl text-left transition-all group cursor-pointer h-full flex flex-col justify-between select-none border-none">
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform mb-4">
                        <Heart className="w-5 h-5 fill-amber-500" />
                      </div>
                      <h3 className="font-display font-bold text-base text-white">I'm looking for blood</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-medium">
                        Someone needs help. Now. Find nearby voluntary donors and hospital blood banks instantly.
                      </p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 bg-red-650 text-[10.5px] font-black rounded-lg text-white font-mono tracking-wide group-hover:bg-red-600 shadow-md shadow-red-500/10">
                      I Need Blood ➔
                    </span>
                  </button>

                </div>

                <div className="pt-6 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setActiveLoginType('blood_bank');
                    }}
                    className="text-slate-400 hover:text-white flex items-center gap-1 bg-transparent border-none cursor-pointer">
                    🏦 I manage a blood bank (Register bank)
                  </button>
                  <div className="text-slate-500">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setAuthMode('login')} 
                      className="text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">
                      Login here
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* LOG IN MODULES */}
            {authMode === 'login' && (
              <div className="max-w-md mx-auto bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                
                <div className="text-center space-y-2 mb-6">
                  <h2 className="font-display font-black text-2xl text-white">Log In to OneBlood</h2>
                  <p className="text-xs text-slate-400">Select portal access pathway below.</p>
                </div>

                {/* Login Path Toggles */}
                <div className="grid grid-cols-4 gap-1.5 mb-6 bg-slate-950 p-1.5 rounded-xl text-center select-none font-mono">
                  {[
                    { id: 'patient', label: 'Seeker' },
                    { id: 'donor', label: 'Donor' },
                    { id: 'blood_bank', label: 'Hospital' },
                    { id: 'admin', label: 'Admin' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setActiveLoginType(type.id);
                        setDonorLoginError("");
                      }}
                      className={`py-2 px-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer border-none ${
                        activeLoginType === type.id ? 'bg-red-500 text-white shadow-sm' : 'bg-transparent text-slate-400 hover:text-white'
                      }`}>
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* A. SEEKER QUICK LOGIN */}
                {activeLoginType === 'patient' && (
                  <div className="space-y-4 text-center">
                    <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/[0.02] text-left">
                      <h3 className="text-xs font-extrabold text-white flex items-center gap-1 font-sans">
                        <Search className="w-4 h-4 text-red-500 animate-pulse" />
                        Emergency Search Deck
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                        Instant client-side coordinate proximity radial query. Locate O-, A+, AB- compatible donors and stock supplies immediately without logging in.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUserRole('patient');
                        setIsLoggedIn(true);
                        setOneBloodId('OB-' + Math.floor(100000 + Math.random() * 900000));
                        triggerToast("Seeker emergency console active!", "success");
                      }}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/10 cursor-pointer border-none uppercase tracking-wider font-mono flex items-center justify-center gap-1.5">
                      Launch SOS Search Radar
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* B. DONOR ACCOUNT LOGIN */}
                {activeLoginType === 'donor' && (
                  <form onSubmit={handleDonorLogin} className="space-y-4 font-sans">
                    <div className="space-y-1.5">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email Address</label>
                      <input
                        type="email" required
                        value={donorLoginForm.email}
                        onChange={(e) => setDonorLoginForm({ ...donorLoginForm, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors"
                        placeholder="e.g. amit@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Password</label>
                      <input
                        type="password" required
                        value={donorLoginForm.password}
                        onChange={(e) => setDonorLoginForm({ ...donorLoginForm, password: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors"
                        placeholder="Enter donor password"
                      />
                    </div>

                    {donorLoginError && (
                      <div className="p-2.5 bg-red-950/40 border border-red-900 text-red-400 text-[10.5px] rounded-lg">
                        ⚠️ {donorLoginError}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={triggerDonorAutofill}
                        className="flex-1 py-3 border border-slate-800 hover:border-slate-700 hover:bg-slate-950 rounded-xl text-slate-400 cursor-pointer bg-transparent">
                        Autofill Demo
                      </button>
                      <button
                        type="submit"
                        disabled={donorLoading}
                        className="flex-1 py-3 bg-red-650 hover:bg-red-600 text-white font-extrabold rounded-xl shadow-lg shadow-red-500/10 cursor-pointer border-none uppercase tracking-wider">
                        {donorLoading ? "Verifying..." : "Sign In"}
                      </button>
                    </div>
                  </form>
                )}

                {/* C. HOSPITAL REPOSITORY LOG IN */}
                {activeLoginType === 'blood_bank' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-500/5 border border-blue-500/15 text-blue-400 text-[10.5px] rounded-lg">
                      🏦 Institutional repository admin dashboard is synchronized under general Admin logs. Connect via Admin Pathway.
                    </div>
                    <button
                      onClick={() => setActiveLoginType('admin')}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer border-none font-mono">
                      Switch to Admin login
                    </button>
                  </div>
                )}

                {/* D. PLATFORM ADMIN AUTH */}
                {activeLoginType === 'admin' && (
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Admin Email</label>
                      <input
                        type="email" required
                        value={adminLoginForm.email}
                        onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors"
                        placeholder="e.g. admin@oneblood.org"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Password</label>
                      <input
                        type="password" required
                        value={adminLoginForm.password}
                        onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors"
                        placeholder="Enter admin password"
                      />
                    </div>

                    {adminLoginError && (
                      <div className="p-2.5 bg-red-950/40 border border-red-900 text-red-400 text-[10.5px] rounded-lg">
                        ⚠️ {adminLoginError}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={triggerAdminAutofill}
                        className="flex-1 py-3 border border-slate-800 hover:border-slate-700 hover:bg-slate-950 rounded-xl text-slate-400 cursor-pointer bg-transparent">
                        Autofill Demo
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-red-650 hover:bg-red-600 text-white font-extrabold rounded-xl shadow-lg shadow-red-500/10 cursor-pointer border-none uppercase tracking-wider">
                        Authorize Admin
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setAuthMode('select')}
                    className="text-slate-500 hover:text-slate-300 font-bold bg-transparent border-none cursor-pointer font-mono">
                    ◀ Choose Role
                  </button>
                  <div className="text-slate-400">
                    New to OneBlood?{' '}
                    <button
                      onClick={() => {
                        setAuthMode('register');
                        setSignUpForm({ name: '', email: '', phone: '', city: 'Bengaluru', password: '' });
                      }}
                      className="text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer">
                      Enroll now
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* SIGN UP REGISTRATION PATH */}
            {authMode === 'register' && (
              <div className="max-w-xl mx-auto bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                
                <div className="text-center space-y-2 mb-6">
                  <h2 className="font-display font-black text-2xl text-white">Create Seeker Account</h2>
                  <p className="text-xs text-slate-400">Locate compatible donors and hospital repositories instantly.</p>
                </div>

                {activeLoginType === 'donor' ? (
                  // Redirect Donor registration to wizard component
                  <div className="space-y-4 font-sans">
                    <div className="p-4 bg-red-500/5 border border-red-500/15 text-red-400 text-xs rounded-xl">
                      🩸 Voluntary Donor profile onboarding operates under clinical-grade wizard parameters. Access enrollment below.
                    </div>
                    <button
                      onClick={() => {
                        setUserRole('patient');
                        setIsLoggedIn(true);
                        triggerToast("Seeker console active. Switch role to donor profile.", "success");
                      }}
                      className="w-full py-3 bg-red-650 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer border-none uppercase tracking-wider font-mono">
                      Activate account & Complete Donor Wizard
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePatientRegister} className="space-y-4">
                    
                    {/* Persona Onboarding Switches */}
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setActiveLoginType('donor');
                        }}
                        className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-left cursor-pointer group border-none">
                        <span className="block text-[8.5px] font-black uppercase text-slate-500 font-mono tracking-widest">Option 1</span>
                        <h4 className="text-xs font-bold text-white mt-1 group-hover:text-red-400">I want to donate (Donor)</h4>
                      </button>
                      <button
                        type="button"
                        className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-left cursor-pointer border-none">
                        <span className="block text-[8.5px] font-black uppercase text-red-400 font-mono tracking-widest animate-pulse">Option 2 (Selected)</span>
                        <h4 className="text-xs font-bold text-red-400 mt-1">I'm looking for blood</h4>
                      </button>
                    </div>

                    <hr className="border-slate-850" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Full Name</label>
                        <input
                          type="text" required
                          value={signUpForm.name}
                          onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                          className={`w-full bg-slate-950 border ${validationErrors.name ? 'border-red-500' : 'border-slate-800'} rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors`}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email Address</label>
                        <input
                          type="email" required
                          value={signUpForm.email}
                          onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                          className={`w-full bg-slate-950 border ${validationErrors.email ? 'border-red-500' : 'border-slate-800'} rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors`}
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Phone Number</label>
                        <input
                          type="tel" required
                          value={signUpForm.phone}
                          onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                          className={`w-full bg-slate-950 border ${validationErrors.phone ? 'border-red-500' : 'border-slate-800'} rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors font-mono`}
                          placeholder="10-digit mobile number"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">City</label>
                        <input
                          type="text" required
                          value={signUpForm.city}
                          onChange={(e) => setSignUpForm({ ...signUpForm, city: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors"
                          placeholder="e.g. Hubballi"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Password</label>
                      <input
                        type="password" required
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                        className={`w-full bg-slate-950 border ${validationErrors.password ? 'border-red-500' : 'border-slate-800'} rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500 transition-colors`}
                        placeholder="Min 6 characters"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-red-650 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/10 cursor-pointer border-none uppercase tracking-wider font-mono flex items-center justify-center gap-1.5">
                      Register Account
                    </button>
                  </form>
                )}

                <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => setAuthMode('select')}
                    className="text-slate-500 hover:text-slate-300 font-bold bg-transparent border-none cursor-pointer">
                    ◀ Onboarding
                  </button>
                  <div className="text-slate-400">
                    Already have an account?{' '}
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-red-500 font-bold hover:underline bg-transparent border-none cursor-pointer font-sans">
                      Login here
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* ==================================================================== */}
          {/* ✨ GORGEOUS LANDING PAGE SECTION 2: ONEBLOOD'S IMPACT (HALL OF FAME) */}
          {/* ==================================================================== */}
          <section className="bg-slate-950/40 py-16 border-t border-b border-slate-900">
            <div className="max-w-6xl mx-auto px-4 text-center space-y-12">
              
              <div className="space-y-4 max-w-xl mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-[10px] font-black tracking-widest text-amber-500 uppercase font-mono">
                  🏆 HALL OF FAME
                </span>
                <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight leading-tight">
                  OneBlood's Impact — Since Day One
                </h2>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-sans font-medium">
                  Every number here is a life touched. Every drop donated through OneBlood has made this possible.
                </p>
              </div>

              {/* 4 Cards Grid Layout with premium dark glassmorphic styling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none font-mono">
                
                {/* 1. Successful Donations */}
                <div className="bg-[#111625]/60 backdrop-blur-md border border-slate-850 p-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </div>
                  </div>
                  <b className="text-4xl font-black text-red-500 block mb-1">850</b>
                  <span className="text-[9.5px] font-bold text-slate-500 tracking-wider uppercase block">SUCCESSFUL DONATIONS</span>
                </div>

                {/* 2. Transfusions Completed */}
                <div className="bg-[#111625]/60 backdrop-blur-md border border-slate-850 p-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Syringe className="w-5 h-5" />
                    </div>
                  </div>
                  <b className="text-4xl font-black text-blue-500 block mb-1">740</b>
                  <span className="text-[9.5px] font-bold text-slate-500 tracking-wider uppercase block">TRANSFUSIONS COMPLETED</span>
                </div>

                {/* 3. Lives Impacted */}
                <div className="bg-[#111625]/60 backdrop-blur-md border border-slate-850 p-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <Heart className="w-5 h-5 text-red-400 fill-red-450 animate-pulse" />
                    </div>
                  </div>
                  <b className="text-4xl font-black text-red-500 block mb-1">2,550</b>
                  <span className="text-[9.5px] font-bold text-slate-500 tracking-wider uppercase block">LIVES IMPACTED</span>
                </div>

                {/* 4. Cities Reached */}
                <div className="bg-[#111625]/60 backdrop-blur-md border border-slate-850 p-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <b className="text-4xl font-black text-blue-500 block mb-1">7</b>
                  <span className="text-[9.5px] font-bold text-slate-500 tracking-wider uppercase block">CITIES REACHED</span>
                </div>

              </div>

            </div>
          </section>

        </div>
      ) : (
        /* ======================================================== */
        /* 🚀 RUNNING STATE: THE FULL-STACK ONEBLOOD WORKSPACE HUD */
        /* ======================================================== */
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* ========================================== */}
          {/* A. SEEKER (PATIENT) EMERGENCY SEARCH PORTAL */}
          {/* ========================================== */}
          {userRole === 'patient' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Panel: Search Query & AI Document Upload Controls */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Search Mode Toggles */}
                <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl text-center select-none font-mono">
                  <button
                    onClick={() => setSearchMethod('smart')}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none ${
                      searchMethod === 'smart' ? 'bg-red-500 text-white shadow-sm' : 'bg-transparent text-slate-400 hover:text-white'
                    }`}>
                    Smart Search
                  </button>
                  <button
                    onClick={() => setSearchMethod('manual')}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none ${
                      searchMethod === 'manual' ? 'bg-red-500 text-white shadow-sm' : 'bg-transparent text-slate-400 hover:text-white'
                    }`}>
                    Manual Search
                  </button>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
                  
                  {searchMethod === 'smart' ? (
                    /* SMART SEARCH: AI OCR DRAG AND DROP ZONE */
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="border border-red-500/10 bg-red-500/[0.01] p-3 rounded-lg flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                        <p className="text-[10px] text-red-400 leading-relaxed font-mono uppercase font-semibold">
                          EMERGENCY: Upload doctor prescription letter for instant verification matches.
                        </p>
                      </div>

                      <div className="border-2 border-dashed border-slate-850 hover:border-red-500/30 rounded-xl p-6 text-center cursor-pointer transition-colors relative bg-slate-950/40">
                        <input
                          type="file"
                          id="ocr-prescription-upload"
                          className="hidden"
                          onChange={handleOcrFileSelect}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <label htmlFor="ocr-prescription-upload" className="cursor-pointer space-y-2 block select-none">
                          <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400 mx-auto group-hover:scale-105 transition-transform">
                            {ocrScanning ? (
                              <Compass className="w-5 h-5 text-red-500 animate-spin" />
                            ) : (
                              <Upload className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-300">
                            {uploadedFile ? `Selected: ${uploadedFile.name}` : "Drop prescription letter here"}
                          </div>
                          <p className="text-[9px] text-slate-550 font-mono">PDF, JPG, PNG - Mobile Camera supported 📷</p>
                        </label>
                      </div>

                      {ocrScanning && (
                        <div className="text-center py-2 text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
                          <Compass className="w-4 h-4 text-red-500 animate-spin" />
                          Analyzing requisition logs...
                        </div>
                      )}

                      {ocrSuccess && ocrParsedData && (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-455 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Requisition Verified (Confidence: {ocrParsedData.confidence}%)
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono border-t border-slate-850 pt-2">
                            <div>Patient: <b className="text-white">{ocrParsedData.patientName}</b></div>
                            <div>Group: <b className="text-red-400">{ocrParsedData.bloodGroup}</b></div>
                            <div className="col-span-2">Hospital: <b className="text-white">{ocrParsedData.hospitalName}</b></div>
                            <div className="col-span-2">Doctor Lic: <b className="text-slate-300">{ocrParsedData.licenseNumber}</b></div>
                          </div>
                          <button
                            onClick={triggerProximityBroadcast}
                            className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg tracking-wider uppercase font-mono border-none cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-emerald-500/15">
                            <Radio className="w-3.5 h-3.5 animate-pulse" />
                            Broadcast Emergency Radar
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* MANUAL SEARCH SELECTORS */
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <span className="block text-xs font-bold text-slate-400 mb-2 uppercase font-mono">Select Required Blood Group</span>
                        <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
                          {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(group => (
                            <button
                              key={group}
                              onClick={() => setSearchBloodGroup(group)}
                              className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer border ${
                                searchBloodGroup === group 
                                  ? 'bg-red-500 border-red-400 text-white shadow-sm' 
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}>
                              {group}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Compatible Helper Fallbacks */}
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-1 font-mono">
                        <span className="block text-[9px] font-bold text-slate-500 uppercase">🧬 Compatible blood fallbacks</span>
                        <div className="flex flex-wrap gap-1">
                          {GET_COMPATIBLE_TYPES(searchBloodGroup).map(gp => (
                            <span key={gp} className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${gp === searchBloodGroup ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-900 text-slate-505'}`}>
                              {gp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <hr className="border-slate-850" />

                  {/* Radius slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase font-mono">
                      <span>Search Perimeter</span>
                      <span className="text-red-500 dark:text-red-400 font-mono text-sm">{searchRadius} km</span>
                    </div>
                    <input
                      type="range" min="1" max="25" value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      className="w-full accent-red-500 bg-slate-950 h-2 rounded-lg cursor-pointer border-none"
                    />
                  </div>

                  {/* GPS Locator */}
                  <div className="pt-2 border-t border-slate-850">
                    <span className="block text-xs font-bold text-slate-400 mb-2 uppercase font-mono">Current Location</span>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {locationName}
                        </span>
                        <button onClick={simulateGPSLocation} className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded cursor-pointer">
                          GPS Sync
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-500 font-mono">Lat: {userLocation.latitude.toFixed(4)} | Lng: {userLocation.longitude.toFixed(4)}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mt-2.5 font-mono text-[9px]">
                      <button onClick={() => presetLocation("Hubballi Node", 12.9650, 77.5870)} className="py-1 px-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded cursor-pointer hover:border-slate-700">Hubballi</button>
                      <button onClick={() => presetLocation("Central Bangalore", 12.9716, 77.5946)} className="py-1 px-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded cursor-pointer hover:border-slate-700">Bengaluru</button>
                      <button onClick={() => presetLocation("Dharwad Node", 12.9099, 77.4851)} className="py-1 px-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded cursor-pointer hover:border-slate-700">Dharwad</button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Map & Listings Result Panel */}
              <div className="lg:col-span-8 space-y-6">
                
                {dispatchAlert && (
                  <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-2xl flex items-center justify-between text-xs font-mono animate-in slide-in-from-top-4 duration-200">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                      <div>
                        <span className="block font-black text-red-500">RADAR ACTIVE: {dispatchAlert.requestId}</span>
                        <p className="text-slate-400 text-[10px]">Broadcasting proximity match logs inside compatible {dispatchAlert.bloodGroup} range...</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-red-500/15 border border-red-500/25 px-2 py-0.5 rounded text-red-405 font-bold">{dispatchAlert.matchingDonorsCount} active pool</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Results Lists */}
                  <div className={`md:col-span-7 space-y-6 ${openChatRoom ? 'hidden md:block' : ''}`}>
                    {/* Dynamic CDN loaded Leaflet GPS map */}
                    <InteractiveMap 
                      userLat={userLocation.latitude} 
                      userLng={userLocation.longitude} 
                      radius={searchRadius} 
                      donors={resultsDonors} 
                      bloodBanks={resultsBanks}
                      onSelectSource={(source) => setSelectedResultCard(source)}
                    />

                    {/* Matches filter tabs */}
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex gap-1.5 font-mono">
                        {['all', 'banks', 'donors'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setSearchType(type)}
                            className={`px-3 py-1 text-[10.5px] font-black rounded-full capitalize cursor-pointer transition-all border-none ${
                              searchType === type 
                                ? 'bg-red-500/10 text-red-405 font-extrabold' 
                                : 'bg-slate-950 text-slate-500 hover:text-slate-305'
                            }`}>
                            {type === 'all' ? 'All Matches' : type === 'banks' ? 'Banks' : 'Volunteers'}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Unified Results: {resultsBanks.length + resultsDonors.length} found</span>
                    </div>

                    {/* Listings cards */}
                    <div className="space-y-3">
                      {searching ? (
                        <div className="py-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-1.5 font-mono">
                          <Compass className="w-6 h-6 text-red-500 animate-spin" />
                          <span>Scanning spatial indexes...</span>
                        </div>
                      ) : (
                        <>
                          {/* Institutional Blood Banks results */}
                          {(searchType === 'all' || searchType === 'banks') && resultsBanks.map((bank) => (
                            <div 
                              key={`bank-${bank.id}`}
                              onClick={() => setSelectedResultCard({ ...bank, type: 'bloodbank' })}
                              className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl hover:border-red-500/20 transition-all flex flex-col justify-between cursor-pointer select-none group font-mono text-xs">
                              <div>
                                <div className="flex justify-between items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 bg-red-500/10 text-[9px] font-black uppercase text-red-500 border border-red-500/20 rounded">
                                    Blood Bank
                                  </span>
                                  <span className="text-xs bg-slate-950 px-2 py-0.5 rounded text-slate-300 font-black border border-slate-850">
                                    {bank.availableBags} Units
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white group-hover:text-red-450 transition-colors font-sans">{bank.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">📍 {bank.address}</p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500">
                                <span className="flex items-center gap-1 font-sans">
                                  <Phone className="w-3 h-3 text-red-500" />
                                  {bank.contactNumber}
                                </span>
                                <span className="flex items-center gap-1 font-sans">
                                  Distance: <b className="text-slate-300 font-mono">{bank.distance} km</b>
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Voluntary Donors results */}
                          {(searchType === 'all' || searchType === 'donors') && resultsDonors.map((donor) => (
                            <div 
                              key={`donor-${donor.id}`}
                              onClick={() => setSelectedResultCard({ ...donor, type: 'donor' })}
                              className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl hover:border-red-500/20 transition-all flex flex-col justify-between cursor-pointer select-none group font-mono text-xs">
                              <div>
                                <div className="flex justify-between items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-[9px] font-black uppercase text-emerald-500 border border-emerald-500/20 rounded">
                                    Donor
                                  </span>
                                  <span className="text-xs bg-red-500 text-white font-black px-2.5 py-0.5 rounded-full">
                                    {donor.bloodGroup}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors font-sans">{donor.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Active & Available</span>
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500">
                                <div className="flex items-center gap-1 font-sans">
                                  {donor.locked ? (
                                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5 italic">
                                      <Lock className="w-3 h-3 text-slate-550" />
                                      Phone Encrypted
                                    </span>
                                  ) : (
                                    <span className="text-emerald-450 font-bold flex items-center gap-0.5">
                                      <Phone className="w-3 h-3 text-emerald-500 animate-pulse" />
                                      {donor.phone}
                                    </span>
                                  )}
                                </div>
                                <span className="flex items-center gap-1 font-sans">
                                  Distance: <b className="text-slate-300 font-mono">{donor.distance} km</b>
                                </span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Direct Message Chat simulator Panel */}
                  <div className={`md:col-span-5 space-y-6 ${!openChatRoom ? 'hidden md:block' : ''}`}>
                    {openChatRoom ? (
                      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col h-[480px] font-sans">
                        
                        {/* Chat header */}
                        <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold font-mono text-xs">
                              {openChatRoom.name.substring(0, 1)}
                            </div>
                            <div className="text-xs">
                              <h4 className="font-extrabold text-white font-sans">{openChatRoom.name} ({openChatRoom.bloodGroup})</h4>
                              <span className="block text-[9.5px] text-emerald-400 font-bold flex items-center gap-0.5 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                {openChatRoom.oneBloodId} | {openChatRoom.phone}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => setOpenChatRoom(null)} className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer">
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        {/* Message list log */}
                        <div className="flex-1 overflow-y-auto space-y-2.5 p-1 scrollbar-thin scrollbar-thumb-slate-800">
                          {chatMessages.map(msg => {
                            if (msg.isSystem) {
                              return (
                                <div key={msg.id} className="text-center text-[9px] font-mono font-bold text-slate-500 py-1 bg-slate-950/40 rounded border border-slate-850">
                                  {msg.text}
                                </div>
                              );
                            }
                            const isMe = msg.sender === 'me';
                            return (
                              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                                  isMe ? 'bg-red-650 text-white rounded-br-none shadow-md shadow-red-500/5' : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                                }`}>
                                  <p>{msg.text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Input bar */}
                        <form onSubmit={handleSendMessage} className="mt-3 pt-2 border-t border-slate-850 flex gap-1.5 select-none font-mono">
                          <input
                            type="text"
                            value={typedMessage}
                            onChange={(e) => setTypedMessage(e.target.value)}
                            placeholder="Type secure message..."
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-white focus:border-red-500 transition-colors"
                          />
                          <button 
                            type="submit"
                            className="w-8.5 h-8.5 rounded-lg bg-red-650 hover:bg-red-600 text-white flex items-center justify-center shadow cursor-pointer border-none">
                            <Send className="w-4 h-4" />
                          </button>
                        </form>

                      </div>
                    ) : (
                      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-sm text-center py-16 text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-455">
                          <MessageSquare className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-350">Secure Chat Console</h4>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-relaxed mx-auto font-sans">
                            Initiate an emergency broadcast or inspect matching results to unlock chat.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* ✨ MODAL DETAILS: INSPECT RESULT OVERLAY */}
              {selectedResultCard && (
                <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-[#111625]/95 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-200 font-mono">
                    
                    <button onClick={() => setSelectedResultCard(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent">
                      <X className="w-5 h-5" />
                    </button>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-2.5 ${
                      selectedResultCard.type === 'bloodbank' ? 'bg-red-500/10 text-red-405 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                    }`}>
                    {selectedResultCard.type === 'bloodbank' ? 'Blood Bank' : 'Emergency Voluntary Donor'}
                    </span>

                    <h3 className="text-lg font-black text-white font-sans">{selectedResultCard.name}</h3>
                    
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium font-sans">
                      📍 {selectedResultCard.address || `${selectedResultCard.city || 'Bangalore City'}, ${selectedResultCard.state || 'Karnataka'}`}
                    </p>

                    {/* Donor expanded medical indicators */}
                    {selectedResultCard.type === 'donor' && (
                      <div className="my-5 space-y-4 p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs">
                        
                        <span className="block text-[9px] text-slate-500 font-black uppercase tracking-wider mb-2">Registered Profile (Verified)</span>
                        
                        <div className="grid grid-cols-2 gap-3 text-slate-300">
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Age</span>
                            <b>{selectedResultCard.age || 25} Years Old</b>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Blood Category</span>
                            <b className="text-red-405">{selectedResultCard.bloodGroup}</b>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Last Donated Date</span>
                            <b>{selectedResultCard.lastDonatedDate || 'Never / No date'}</b>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Emergency Consent</span>
                            <b className="text-emerald-450">ACTIVE</b>
                          </div>
                        </div>

                        <div className="border-t border-slate-850 pt-2.5 mt-2.5">
                          <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Medical/General notes</span>
                          <p className="text-[11px] font-sans text-slate-400 leading-normal italic">
                            "{selectedResultCard.medicalHistory || 'None provided'}"
                          </p>
                        </div>

                        {/* Screening indicators */}
                        <div className="border-t border-slate-850 pt-2.5 mt-2.5">
                          <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Eligibility Screening</span>
                          {selectedResultCard.eligibilityFlags && selectedResultCard.eligibilityFlags.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedResultCard.eligibilityFlags.map(item => (
                                <span key={item} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold rounded">
                                  ⚠️ {item}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                              ✓ No chronic conditions flagged
                            </span>
                          )}
                        </div>

                      </div>
                    )}

                    {/* Inventory details for repositories */}
                    {selectedResultCard.type === 'bloodbank' && (
                      <div className="my-5 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono">
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-3">Available stocks (Bags)</span>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {Object.entries(selectedResultCard.inventory || {}).map(([gp, bags]) => (
                            <div key={gp} className={`p-2 rounded-lg border ${gp === searchBloodGroup ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-900 border-slate-855'}`}>
                              <span className="block text-[10px] text-slate-505">{gp}</span>
                              <b className={`text-xs ${bags < 5 ? 'text-amber-450 font-black' : 'text-slate-200'}`}>{bags} bags</b>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-850 text-xs">
                      <div>
                        <span className="block text-[9px] text-slate-500 font-bold uppercase mb-1.5">Voice Call dispatch</span>
                        {selectedResultCard.type === 'donor' && selectedResultCard.locked ? (
                          <button
                            onClick={() => {
                              // Simulate dispatch handshake to unlock profile contacts
                              setResultsDonors(prev => prev.map(d => {
                                if (d.id === selectedResultCard.id) return { ...d, locked: false };
                                return d;
                              }));
                              setSelectedResultCard(prev => ({ ...prev, locked: false }));
                              triggerToast("Emergency dispatcher handshake triggered. Coordinates unlocked!", "success");
                              setOpenChatRoom({
                                oneBloodId: selectedResultCard.oneBloodId || "OB-849120",
                                name: selectedResultCard.name,
                                phone: selectedResultCard.phone,
                                bloodGroup: selectedResultCard.bloodGroup,
                                distance: selectedResultCard.distance
                              });
                              setChatMessages([
                                { id: 1, text: `Secure Room opened with ${selectedResultCard.name}. Coordinates decrypted!`, isSystem: true }
                              ]);
                            }}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-red-650 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-extrabold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-500/10 border-none uppercase font-mono">
                            <Lock className="w-4 h-4" />
                            Unlock Profile
                          </button>
                        ) : (
                          <a 
                            href={`tel:${selectedResultCard.phone || selectedResultCard.contactNumber}`}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-650 text-white font-extrabold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10 text-decoration-none">
                            <Phone className="w-4 h-4 text-white animate-pulse" />
                            Call Dispatcher
                          </a>
                        )}
                      </div>

                      <div>
                        <span className="block text-[9px] text-slate-550 font-bold uppercase mb-1.5">Navigation Router</span>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedResultCard.latitude},${selectedResultCard.longitude}`}
                          target="_blank" rel="noreferrer"
                          className="w-full py-2.5 px-4 bg-slate-900 border border-slate-805 text-slate-300 font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer hover:border-slate-700 text-decoration-none font-mono">
                          <Navigation className="w-4 h-4 text-red-500" />
                          Route ({selectedResultCard.distance} km)
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================== */}
          {/* B. ACTIVE DEDICATED DONOR HUB */}
          {/* ========================================== */}
          {userRole === 'donor' && loggedInDonor && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200 font-mono">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
                <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 font-sans">
                  <User className="w-5.5 h-5.5 text-red-500 animate-pulse" />
                  Voluntary Donor Dashboard
                </h2>
                <span className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1 rounded font-bold text-slate-500">PEER ACTIVE</span>
              </div>

              {/* Status toggler card */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-sm space-y-6 transition-colors">
                
                <div className="p-4 rounded-xl border border-slate-855 bg-slate-955 flex items-center justify-between">
                  <div>
                    <span className={`text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                      loggedInDonor.isAvailable ? 'text-emerald-500 font-extrabold' : 'text-slate-500'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${loggedInDonor.isAvailable ? 'bg-emerald-500 animate-ping' : 'bg-slate-650'}`} />
                      Live Status: {loggedInDonor.isAvailable ? 'AVAILABLE IMMEDIATELY' : 'OFFLINE / BUSY'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-[300px]">
                      {loggedInDonor.isAvailable 
                        ? 'Your contact coordinates are visible in compatible queries.' 
                        : 'Your profile has been excluded from emergency geofenced lookups.'}
                    </p>
                  </div>

                  <button
                    onClick={toggleAvailability}
                    className={`w-14 h-8 rounded-full transition-all relative flex items-center cursor-pointer border-none ${
                      loggedInDonor.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'
                    }`}>
                    <div className={`w-6 h-6 rounded-full bg-white transition-all shadow absolute ${
                      loggedInDonor.isAvailable ? 'left-[31px]' : 'left-[3px]'
                    }`} />
                  </button>
                </div>

                {/* Info summary */}
                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  
                  <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Donor Name</span>
                    <p className="text-white font-extrabold mt-1 font-sans">{loggedInDonor.name}</p>
                  </div>
                  
                  <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Blood Category</span>
                    <p className="text-red-405 font-black mt-1 flex items-center gap-1 font-sans">
                      <Heart className="w-3.5 h-3.5 fill-red-500 animate-pulse" />
                      {loggedInDonor.bloodGroup}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Phone Number</span>
                    <p className="text-white font-extrabold mt-1 font-sans">{loggedInDonor.phone}</p>
                  </div>

                  <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Age</span>
                    <p className="text-white font-extrabold mt-1 font-sans">{loggedInDonor.age || 25} Years</p>
                  </div>

                  <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Location</span>
                    <p className="text-white font-extrabold mt-1 font-sans">{loggedInDonor.city || 'Bangalore'}, {loggedInDonor.state || 'Karnataka'}</p>
                  </div>

                  <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Health Checks</span>
                    <p className="text-emerald-450 font-extrabold mt-1 font-sans">✓ Screened</p>
                  </div>

                </div>

                {/* Wizard enrollment panel shortcut */}
                <div className="pt-4 border-t border-slate-850 text-center">
                  <span className="text-[10px] text-slate-550 block mb-2">Want to re-onboard clinical metrics?</span>
                  <button
                    onClick={() => {
                      setRegistrationStep(1);
                      setAuthMode('register');
                      setIsLoggedIn(false);
                      triggerToast("Launching stepped clinical wizard...", "info");
                    }}
                    className="px-4 py-2 bg-slate-955 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono">
                    Relaunch Donor Wizard
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* C. INSTITUTIONAL BLOOD BANK REPOSITORY LEDGER */}
          {/* ========================================== */}
          {userRole === 'blood_bank' && (
            <div className="space-y-6 animate-in fade-in duration-200 font-mono">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 font-sans">
                    <Landmark className="w-5.5 h-5.5 text-red-500 animate-pulse" />
                    Institutional Stock Repository Ledger
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage blood units inventory records in real time.</p>
                </div>
                
                <button
                  onClick={() => {
                    setValidationErrors({});
                    setShowAddBankPanel(!showAddBankPanel);
                  }}
                  className="text-xs bg-red-600 hover:bg-red-750 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border-none">
                  <Plus className="w-3.5 h-3.5" />
                  Add Facility bank
                </button>
              </div>

              {showAddBankPanel && (
                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-md max-w-xl mx-auto animate-in slide-in-from-top-4 duration-200">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2.5 mb-4 font-mono">
                    <h3 className="text-xs font-black uppercase text-slate-300">Register new hospital repository</h3>
                    <button onClick={() => setShowAddBankPanel(false)} className="text-slate-500 hover:text-slate-300 text-xs bg-transparent border-none cursor-pointer">
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleBankRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1 uppercase font-mono">Facility Name</label>
                      <input 
                        type="text" required
                        value={newBankForm.name}
                        onChange={(e) => setNewBankForm({ ...newBankForm, name: e.target.value })}
                        className={`w-full bg-slate-950 border ${validationErrors.bankName ? 'border-red-400' : 'border-slate-800'} rounded-lg px-3 py-2 text-xs outline-none text-white`}
                      />
                      {validationErrors.bankName && <p className="text-[9px] text-red-500 mt-1">{validationErrors.bankName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 font-bold mb-1 uppercase font-mono">Contact Phone</label>
                        <input 
                          type="tel" required
                          value={newBankForm.contactNumber}
                          onChange={(e) => setNewBankForm({ ...newBankForm, contactNumber: e.target.value })}
                          className={`w-full bg-slate-950 border ${validationErrors.bankPhone ? 'border-red-400' : 'border-slate-800'} rounded-lg px-3 py-2 text-xs outline-none text-white`}
                        />
                        {validationErrors.bankPhone && <p className="text-[9px] text-red-500 mt-1">{validationErrors.bankPhone}</p>}
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 font-bold mb-1 uppercase font-mono">Street Address</label>
                        <input 
                          type="text" required
                          value={newBankForm.address}
                          onChange={(e) => setNewBankForm({ ...newBankForm, address: e.target.value })}
                          className={`w-full bg-slate-950 border ${validationErrors.bankAddress ? 'border-red-400' : 'border-slate-800'} rounded-lg px-3 py-2 text-xs outline-none text-white`}
                        />
                        {validationErrors.bankAddress && <p className="text-[9px] text-red-500 mt-1">{validationErrors.bankAddress}</p>}
                      </div>
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all uppercase border-none cursor-pointer">
                      Confirm Repository Registration
                    </button>
                  </form>
                </div>
              )}

              {/* hospital inventory rows */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-955 border-b border-slate-850 text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">
                      <th className="p-4">Facility Name</th>
                      <th className="p-4 hidden md:table-cell">Street Address</th>
                      <th className="p-4">Capacity Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs">
                    {localBanks.map((bank) => {
                      const totalBags = Object.values(bank.inventory || {}).reduce((a, b) => a + b, 0);
                      const hasLow = Object.values(bank.inventory || {}).some(b => b < 5);

                      return (
                        <tr key={bank.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4 font-bold text-white">
                            {bank.name}
                            <span className="block md:hidden text-[9px] text-slate-505 mt-0.5">{bank.address}</span>
                          </td>
                          <td className="p-4 text-slate-400 hidden md:table-cell">{bank.address}</td>
                          <td className="p-4 font-mono font-bold">
                            <span className={`inline-flex items-center gap-1 ${hasLow ? 'text-amber-400' : 'text-slate-400'}`}>
                              {totalBags} bags
                              {hasLow && <AlertTriangle className="w-3.5 h-3.5 fill-none animate-pulse" />}
                            </span>
                          </td>
                          <td className="p-4 text-right font-sans">
                            <button
                              onClick={() => setAdminSelectedBank(bank)}
                              className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-lg hover:border-red-500/50 cursor-pointer text-[10px] font-mono">
                              Adjust Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ✨ MODAL OVERLAY: STOCK ADJUSTER */}
              {adminSelectedBank && (
                <div className="fixed inset-0 bg-slate-955/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-[#111625]/95 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-200 font-mono">
                    
                    <button onClick={() => setAdminSelectedBank(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent">
                      <X className="w-5 h-5" />
                    </button>

                    <div className="border-b border-slate-850 pb-3 mb-4 font-mono">
                      <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider">Inventory ledger stock controls</span>
                      <h3 className="text-base font-extrabold text-white font-sans mt-0.5">{adminSelectedBank.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(adminSelectedBank.inventory || {}).map(([group, val]) => {
                        const isLow = val < 5;

                        return (
                          <div 
                            key={`adjust-${group}`}
                            className={`p-2.5 border rounded-xl flex flex-col justify-between items-center text-center bg-slate-955 ${
                              isLow ? 'border-amber-500/40' : 'border-slate-800'
                            }`}>
                            <span className="text-xs font-black text-slate-500 font-mono">{group}</span>
                            
                            <span className={`text-base font-black my-1.5 font-mono ${isLow ? 'text-amber-450 animate-pulse' : 'text-slate-200'}`}>
                              {val} bags
                            </span>

                            <div className="flex gap-1 w-full font-sans">
                              <button
                                onClick={() => handleUpdateInventory(group, 'dec')}
                                className="flex-1 py-0.5 text-xs font-bold bg-slate-900 border border-slate-805 text-slate-300 rounded cursor-pointer">-</button>
                              <button
                                onClick={() => handleUpdateInventory(group, 'inc')}
                                className="flex-1 py-0.5 text-xs font-bold bg-slate-900 border border-slate-805 text-slate-300 rounded cursor-pointer">+</button>
                            </div>
                            
                            {isLow && (
                              <span className="text-[8px] text-amber-500 mt-1 uppercase font-bold tracking-tighter font-mono animate-pulse">CRITICAL STOCK</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================== */}
          {/* D. MASTER ADMINISTRATIVE CONTROL HUD BOARD */}
          {/* ========================================== */}
          {userRole === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-200 font-mono">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest font-mono">Core Control Panel</span>
                  <h2 className="text-2xl font-black tracking-tight text-white font-sans mt-0.5">Admin Monitoring HUD</h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Live statistics, database sync streams, hospital networks, and chat message rooms.</p>
                </div>
                
                <button
                  onClick={handleAdminStatsRefresh}
                  className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm">
                  <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${adminStatsSpinning ? 'animate-spin' : ''}`} />
                  Refresh System Data
                </button>
              </div>

              {/* 1. Large Top Counters Matrix */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Total Accounts", val: 194, color: "text-blue-500" },
                  { label: "Registered Donors", val: 153, color: "text-red-500" },
                  { label: "Linked Blood Banks", val: 37, color: "text-emerald-500" },
                  { label: "Emergency Requests", val: dispatchAlert ? 1 : 0, color: "text-amber-505" },
                  { label: "Chat Logs Exchanged", val: chatMessages.filter(c => !c.isSystem).length, color: "text-slate-400" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg border-t-2 border-t-red-500/50">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">{stat.label}</span>
                    <b className={`text-3xl font-black block mt-2 font-mono ${stat.color}`}>{stat.val}</b>
                  </div>
                ))}
              </div>

              {/* 2. Sub-Grid Core Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start font-sans">
                
                {/* Panel A: Users By Role */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 font-mono tracking-widest flex items-center gap-1">
                    <User className="w-4 h-4 text-red-500" />
                    Users By Role
                  </h3>
                  <div className="space-y-3 font-mono text-xs border-t border-slate-850 pt-3">
                    {[
                      { role: "Patient (Seekers)", count: 3 },
                      { role: "Voluntary Donors", count: 153 },
                      { role: "Blood Banks", count: 37 },
                      { role: "Administrators", count: 1 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400">{item.role}</span>
                        <b className="text-white">{item.count}</b>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel B: Requests by Status */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 font-mono tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Requests by Status
                  </h3>
                  <div className="space-y-3 font-mono text-xs border-t border-slate-850 pt-3">
                    {dispatchAlert ? (
                      <>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-red-405 font-bold">Active Radar Alert</span>
                          <b className="text-emerald-500 animate-pulse">BROADCASTING</b>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Acceptances Handshake</span>
                          <b className="text-white">1 Matched</b>
                        </div>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-550 leading-relaxed font-sans pt-2">No active emergency coordinate dispatches running. System state: Idle.</p>
                    )}
                  </div>
                </div>

                {/* Panel C: Top Cities (Donors) */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 font-mono tracking-widest flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Top Cities (Donors)
                  </h3>
                  <div className="space-y-2 border-t border-slate-850 pt-3 font-mono text-xs max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850">
                    {[
                      { city: "Bengaluru", count: 40 },
                      { city: "Hyderabad", count: 40 },
                      { city: "Hubballi", count: 18 },
                      { city: "Visakhapatnam", count: 15 },
                      { city: "Dharwad", count: 15 },
                      { city: "Vijayawada", count: 15 },
                      { city: "Guntur", count: 10 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400">{item.city}</span>
                        <b className="text-white">{item.count}</b>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel D: Blood Group Stats */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 font-mono tracking-widest flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500/10" />
                    Blood Group Stats
                  </h3>
                  <div className="space-y-2 border-t border-slate-850 pt-3 font-mono text-xs max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850">
                    {[
                      { grp: "O+", count: 53 },
                      { grp: "B+", count: 39 },
                      { grp: "A+", count: 30 },
                      { grp: "A-", count: 9 },
                      { grp: "B-", count: 8 },
                      { grp: "O-", count: 7 },
                      { grp: "AB+", count: 6 },
                      { grp: "AB-", count: 1 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400">Group {item.grp}</span>
                        <b className="text-red-400">{item.count} Donors</b>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* 3. Database connection status debug footer */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs flex justify-between items-center text-slate-500 select-none">
                <span>Database Sync Cluster Connection Status: <b className="text-emerald-500 font-bold">{dbModeStr}</b></span>
                <span>Active WebSocket Port: <b className="text-red-500 font-mono">5000 (Socket.io Synced)</b></span>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 2. Elite visual dark-themed customized support footer matching screenshot */}
      <footer className="border-t border-slate-850 bg-[#090D16] py-12 text-xs text-slate-400 transition-colors select-none">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 font-sans">
          
          {/* Col 1: Logo & description */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <div className="w-7.5 h-7.5 rounded bg-gradient-to-tr from-red-650 to-red-500 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="font-display font-extrabold text-lg text-white">
                OneBlood
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              OneBlood is a state-of-the-art real-time blood emergency platform connecting patients, individual donors, and local blood banks instantly.
            </p>
            <div className="text-[10px] text-emerald-450 font-bold font-mono">
              🛡️ AI-verified medical documentation protection
            </div>
          </div>

          {/* Col 2: QUICK LINKS */}
          <div className="space-y-4 text-left md:pl-12">
            <h4 className="font-mono text-[10.5px] font-black uppercase text-white tracking-widest">QUICK LINKS</h4>
            <ul className="space-y-2 text-[11px] text-slate-400 list-none p-0 font-medium">
              <li><button onClick={() => { setUserRole('patient'); setIsLoggedIn(true); }} className="hover:text-red-500 bg-transparent border-none outline-none cursor-pointer p-0 text-slate-400">Find Donors & Banks</button></li>
              <li><button onClick={() => { setUserRole('patient'); setIsLoggedIn(true); }} className="hover:text-red-500 bg-transparent border-none outline-none cursor-pointer p-0 text-slate-400">Request Emergency Blood</button></li>
              <li><button className="hover:text-red-500 bg-transparent border-none outline-none cursor-pointer p-0 text-slate-400">How It Works</button></li>
              <li><button onClick={() => { setAuthMode('register'); setActiveLoginType('donor'); }} className="hover:text-red-500 bg-transparent border-none outline-none cursor-pointer p-0 text-slate-400">Become a Donor</button></li>
            </ul>
          </div>

          {/* Col 3: CONTACT & SUPPORT */}
          <div className="space-y-4 text-left">
            <h4 className="font-mono text-[10.5px] font-black uppercase text-white tracking-widest">CONTACT & SUPPORT</h4>
            <p className="text-[11px] leading-relaxed font-medium">
              Hubballi-Dharwad District,<br />
              Karnataka, India.
            </p>
            <div className="pt-2">
              <span className="block text-[9.5px] font-bold text-slate-500 font-mono">EMERGENCY RESPONSE HOTLINE</span>
              <a href="tel:108" className="inline-block mt-1 font-mono font-black text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded px-2 py-1 tracking-wider text-decoration-none">
                Emergency Line: 108 / 1910
              </a>
            </div>
          </div>

        </div>

        {/* bottom bar */}
        <div className="max-w-6xl mx-auto px-4 pt-8 border-t border-slate-850/50 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-550">
          <div>
            <p>© 2026 OneBlood. All rights reserved.</p>
          </div>
          <div>
            <p>Made with ❤️ for medical emergency services.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
