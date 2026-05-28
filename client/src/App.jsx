import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Phone, Navigation, User, Search, MapPin, Landmark, 
  Activity, Check, X, ShieldAlert, Compass, RotateCw, Plus, 
  Settings, LogOut, Sun, Moon, AlertTriangle, ArrowRight, Eye, Key, LogIn, Lock, Mail, Award, Calendar, CheckSquare, ChevronDown, Radio, ShieldCheck
} from 'lucide-react';
import InteractiveMap from './components/InteractiveMap';

// Seed data with clinical-grade donor profiles
const INITIAL_LOCAL_DONORS = [
  { id: 1, name: 'Amit Patel', bloodGroup: 'O-', phone: '+91 99001 12233', email: 'amit@example.com', password: 'password123', latitude: 12.9730, longitude: 77.5920, isAvailable: true, distance: 0.3, age: 25, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '2026-03-01', medicalHistory: 'No chronic diseases', eligibilityFlags: [], consentChecked: true },
  { id: 2, name: 'Priya Nair', bloodGroup: 'A+', phone: '+91 99002 23344', email: 'priya@example.com', password: 'password123', latitude: 12.9790, longitude: 77.6010, isAvailable: true, distance: 1.1, age: 28, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '2026-01-15', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true },
  { id: 3, name: 'Vikram Singh', bloodGroup: 'O-', phone: '+91 99003 34455', email: 'vikram@example.com', password: 'password123', latitude: 12.9620, longitude: 77.5910, isAvailable: false, distance: 1.1, age: 34, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '2025-12-05', medicalHistory: 'Under medication', eligibilityFlags: [], consentChecked: true },
  { id: 4, name: 'Sarah D\'Souza', bloodGroup: 'B+', phone: '+91 99004 45566', email: 'sarah@example.com', password: 'password123', latitude: 12.9850, longitude: 77.5750, isAvailable: true, distance: 2.6, age: 22, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true },
  { id: 5, name: 'Rajesh Kumar', bloodGroup: 'O-', phone: '+91 99005 56677', email: 'rajesh@example.com', password: 'password123', latitude: 12.9510, longitude: 77.6150, isAvailable: true, distance: 3.2, age: 41, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '2026-02-28', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true },
  { id: 6, name: 'Kavita Rao', bloodGroup: 'AB-', phone: '+91 99006 67788', email: 'kavita@example.com', password: 'password123', latitude: 13.0150, longitude: 77.6400, isAvailable: true, distance: 6.8, age: 27, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true }
];

const INITIAL_LOCAL_BLOOD_BANKS = [
  {
    id: 1,
    name: 'City Central Blood Bank',
    contactNumber: '+91 98765 43210',
    address: '12, MG Road, Central Business District, Bangalore',
    latitude: 12.9740,
    longitude: 77.5980,
    inventory: { 'A+': 15, 'A-': 5, 'B+': 20, 'B-': 2, 'AB+': 10, 'AB-': 3, 'O+': 14, 'O-': 8 },
    availableBags: 8,
    distance: 0.45
  },
  {
    id: 2,
    name: 'Metro Red Cross Blood Bank',
    contactNumber: '+91 87654 32109',
    address: '45, Residency Road, Shanthala Nagar, Bangalore',
    latitude: 12.9650,
    longitude: 77.5870,
    inventory: { 'A+': 8, 'A-': 4, 'B+': 9, 'B-': 12, 'AB+': 5, 'AB-': 4, 'O+': 10, 'O-': 2 },
    availableBags: 2,
    distance: 1.1
  },
  {
    id: 3,
    name: 'St. Jude Emergency Blood Center',
    contactNumber: '+91 76543 21098',
    address: '88, Outer Ring Road, Kalyan Nagar, Bangalore',
    latitude: 13.0020,
    longitude: 77.6200,
    inventory: { 'A+': 22, 'A-': 12, 'B+': 11, 'B-': 6, 'AB+': 12, 'AB-': 8, 'O+': 25, 'O-': 18 },
    availableBags: 18,
    distance: 4.4
  },
  {
    id: 4,
    name: 'Suburban Healthcare Blood Repository',
    contactNumber: '+91 65432 10987',
    address: '102, Kengeri Main Road, Jnanabharathi, Bangalore',
    latitude: 12.9100,
    longitude: 77.5200,
    inventory: { 'A+': 5, 'A-': 2, 'B+': 6, 'B-': 1, 'AB+': 2, 'AB-': 8, 'O+': 9, 'O-': 5 },
    availableBags: 5,
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
  const [darkMode, setDarkMode] = useState(false);

  // Refs for scrolling to sections
  const bentoRef = useRef(null);
  const worksRef = useRef(null);
  const registerSectionRef = useRef(null);
  const loginSectionRef = useRef(null);

  // --- Auth Session States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'searcher', 'donor', 'admin'
  const [authMode, setAuthMode] = useState('select'); // 'select', 'login', 'register'
  const [activeLoginType, setActiveLoginType] = useState('donor'); // 'donor', 'admin'

  // --- Validation Errors ---
  const [validationErrors, setValidationErrors] = useState({});

  // --- Network Connection State ---
  const [serverOnline, setServerOnline] = useState(false);
  const [dbModeStr, setDbModeStr] = useState('Local Cache');
  const [checkingHealth, setCheckingHealth] = useState(true);

  // --- Coordinates center ---
  const [userLocation, setUserLocation] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const [locationName, setLocationName] = useState('Central Bangalore');

  // --- Search parameters ---
  const [searchBloodGroup, setSearchBloodGroup] = useState('O-');
  const [searchRadius, setSearchRadius] = useState(10);
  const [searchType, setSearchType] = useState('all'); // 'all', 'banks', 'donors'
  
  // --- Search results lists ---
  const [resultsDonors, setResultsDonors] = useState([]);
  const [resultsBanks, setResultsBanks] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedResultCard, setSelectedResultCard] = useState(null);

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
    city: '',
    state: '',
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
    { id: 1, text: "O- Negative emergency match triggered at MG Road", time: "Just now", type: "match" },
    { id: 2, text: "Donor Amit Patel verified availability Live Active", time: "3m ago", type: "active" },
    { id: 3, text: "City Central Blood Bank adjusted inventory A+ levels", time: "8m ago", type: "bank" }
  ]);

  // Rotate simulated radar activity logs periodically
  useEffect(() => {
    const logs = [
      "O- emergency coordinate search centered near MG Road Node",
      "Live Voluntary Donor logged in sector Kalyan Nagar Node",
      "St. Jude Emergency Center dispatch locked target radius O-",
      "Hospital inventory levels updated at Suburban Health Center",
      "Donor Priya Nair confirmed availability state Live Active",
      "Coordinate map beacon re-calibrated Bangalore grid sector"
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
      const res = await fetch('https://bloodconnect-2-l0wd.onrender.com/');
      if (res.ok) {
        const data = await res.json();
        setServerOnline(true);
        setDbModeStr(data.databaseMode === 'mongodb' ? 'MongoDB' : 'SQLite3');
      } else {
        setServerOnline(false);
        setDbModeStr('Local Sandbox');
      }
    } catch (e) {
      setServerOnline(false);
      setDbModeStr('Local Sandbox');
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

  // Scroll helpers
  const scrollToRef = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
          triggerToast("Location updated successfully!", "success");
        },
        (error) => {
          triggerToast("GPS access blocked. Defaulting to center.", "warning");
          setUserLocation({ latitude: 12.9716, longitude: 77.5946 });
          setLocationName("Central Bangalore");
        }
      );
    }
  };

  const presetLocation = (name, lat, lng) => {
    setUserLocation({ latitude: lat, longitude: lng });
    setLocationName(name);
    triggerToast(`Switched center to: ${name}`, "info");
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
        const queryUrl = `https://bloodconnect-2-l0wd.onrender.com/api/blood/search?bloodGroup=${encodeURIComponent(searchBloodGroup)}&radius=${searchRadius}&latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
        const response = await fetch(queryUrl);
        const data = await response.json();
        
        if (data.success) {
          setResultsDonors(data.results.donors || []);
          setResultsBanks(data.results.bloodBanks || []);
        } else {
          triggerToast(data.error || "Search error.", "error");
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
      return { ...d, distance: parseFloat(dist.toFixed(2)) };
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
    if (isLoggedIn && userRole === 'searcher') {
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
      triggerToast("Please review required fields and errors.", "error");
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
      triggerToast("Please check required details and checkbox.", "error");
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

    if (serverOnline) {
      try {
        const res = await fetch('https://bloodconnect-2-l0wd.onrender.com/api/donors/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          triggerToast(`Registration confirmed! Welcome, ${payload.name}!`, "success");
          registerDonorLocally(payload);
        } else {
          triggerToast(data.error, "error");
        }
      } catch (err) {
        registerDonorLocally(payload);
      }
    } else {
      registerDonorLocally(payload);
    }
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
    triggerToast(`Donor profile successfully registered!`, "success");
    // reset form
    setDonorRegisterForm({
      name: '', bloodGroup: 'O-', phone: '', email: '', password: '', latitude: '', longitude: '',
      age: '', city: '', state: '', lastDonatedDate: '', medicalHistory: '', eligibilityFlags: [], consentChecked: false, isAvailable: true
    });
    setRegistrationStep(1);
    setQuestionnaireCollapsed(true);
  };

  const handleDonorLogin = async (e) => {
    e.preventDefault();
    setDonorLoading(true);
    setDonorLoginError('');

    if (!validateEmail(donorLoginForm.email)) {
      setDonorLoginError("Please enter a valid email format.");
      setDonorLoading(false);
      return;
    }

    if (serverOnline) {
      try {
        const res = await fetch('https://bloodconnect-2-l0wd.onrender.com/api/donors/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(donorLoginForm)
        });
        const data = await res.json();
        if (data.success) {
          setLoggedInDonor(data.donor);
          setUserRole('donor');
          setIsLoggedIn(true);
          triggerToast(data.message, "success");
          setDonorLoginForm({ email: '', password: '' });
        } else {
          setDonorLoginError(data.error);
        }
      } catch (err) {
        loginDonorLocally();
      } finally {
        setDonorLoading(false);
      }
    } else {
      loginDonorLocally();
      setDonorLoading(false);
    }
  };

  const loginDonorLocally = () => {
    const check = localDonors.find(d => d.email.toLowerCase() === donorLoginForm.email.toLowerCase() && d.password === donorLoginForm.password);
    if (check) {
      setLoggedInDonor(check);
      setUserRole('donor');
      setIsLoggedIn(true);
      triggerToast(`Welcome back, ${check.name}!`, "success");
      setDonorLoginForm({ email: '', password: '' });
    } else {
      setDonorLoginError("Invalid email or password.");
    }
  };

  // ADMIN LOGIN
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminLoginError('');
    
    if (!validateEmail(adminLoginForm.email)) {
      setAdminLoginError("Please enter a valid email address.");
      return;
    }

    if (adminLoginForm.email.toLowerCase() === 'admin@hemolink.org' && adminLoginForm.password === 'admin123') {
      setUserRole('admin');
      setIsLoggedIn(true);
      triggerToast("Admin portal access authorized.", "success");
      setAdminLoginForm({ email: '', password: '' });
    } else {
      setAdminLoginError("Invalid administrator credentials.");
    }
  };

  // DEMO CREDENTIAL QUICK LOGINS
  const triggerDonorAutofill = () => {
    setDonorLoginForm({ email: 'amit@example.com', password: 'password123' });
    triggerToast("Credentials loaded. Click Sign In!", "info");
  };

  const triggerAdminAutofill = () => {
    setAdminLoginForm({ email: 'admin@hemolink.org', password: 'admin123' });
    triggerToast("Credentials loaded. Click Sign In!", "info");
  };

  const toggleAvailability = async () => {
    if (!loggedInDonor) return;
    const targetStatus = !loggedInDonor.isAvailable;

    if (serverOnline) {
      try {
        const res = await fetch('https://bloodconnect-2-l0wd.onrender.com/api/donors/toggle-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loggedInDonor.email, isAvailable: targetStatus })
        });
        const data = await res.json();
        if (data.success) {
          setLoggedInDonor(prev => ({ ...prev, isAvailable: targetStatus }));
          triggerToast(data.message, "success");
          executeSearch();
        } else {
          triggerToast(data.error, "error");
        }
      } catch (err) {
        toggleAvailabilityLocally(targetStatus);
      }
    } else {
      toggleAvailabilityLocally(targetStatus);
    }
  };

  const toggleAvailabilityLocally = (status) => {
    setLocalDonors(prev => prev.map(d => {
      if (d.email.toLowerCase() === loggedInDonor.email.toLowerCase()) {
        return { ...d, isAvailable: status };
      }
      return d;
    }));
    setLoggedInDonor(prev => ({ ...prev, isAvailable: status }));
    triggerToast(`Live availability status updated!`, "success");
  };

  // ADMIN REGISTER BANK
  const handleBankRegister = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!newBankForm.name.trim()) errors.bankName = "Hospital Name is required.";
    if (!newBankForm.address.trim()) errors.bankAddress = "Address is required.";
    if (!validatePhone(newBankForm.contactNumber)) errors.bankPhone = "Please enter a valid phone number.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      triggerToast("Please fix registration errors.", "error");
      return;
    }

    setValidationErrors({});
    const lat = newBankForm.latitude ? parseFloat(newBankForm.latitude) : 12.9716 + (Math.random() - 0.5) * 0.12;
    const lng = newBankForm.longitude ? parseFloat(newBankForm.longitude) : 77.5946 + (Math.random() - 0.5) * 0.12;
    
    const payload = { ...newBankForm, latitude: lat, longitude: lng };

    if (serverOnline) {
      try {
        const res = await fetch('https://bloodconnect-2-l0wd.onrender.com/api/bloodbanks/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          triggerToast(`Repository '${payload.name}' registered!`, "success");
          setNewBankForm({
            name: '', contactNumber: '', address: '', latitude: '', longitude: '',
            inventory: { 'A+': 10, 'A-': 5, 'B+': 10, 'B-': 5, 'AB+': 5, 'AB-': 2, 'O+': 15, 'O-': 8 }
          });
          setShowAddBankPanel(false);
          executeSearch();
        } else {
          triggerToast(data.error, "error");
        }
      } catch (err) {
        registerBankLocally(payload);
      }
    } else {
      registerBankLocally(payload);
    }
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

  const handleUpdateInventory = async (group, action) => {
    if (!adminSelectedBank) return;
    
    const updatedInventory = { ...adminSelectedBank.inventory };
    const currentVal = updatedInventory[group] || 0;
    
    if (action === 'inc') {
      updatedInventory[group] = currentVal + 1;
    } else if (action === 'dec') {
      updatedInventory[group] = Math.max(0, currentVal - 1);
    }

    if (serverOnline) {
      try {
        const res = await fetch(`https://bloodconnect-2-l0wd.onrender.com/api/bloodbanks/${adminSelectedBank.id}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inventory: updatedInventory })
        });
        const data = await res.json();
        if (data.success) {
          setAdminSelectedBank(prev => ({ ...prev, inventory: data.inventory }));
          triggerToast("Inventory updated!", "success");
          executeSearch();
        } else {
          triggerToast(data.error, "error");
        }
      } catch (err) {
        updateInventoryLocally(updatedInventory);
      }
    } else {
      updateInventoryLocally(updatedInventory);
    }
  };

  const updateInventoryLocally = (updatedInv) => {
    setLocalBanks(prev => prev.map(b => {
      if (b.id === adminSelectedBank.id) {
        return { ...b, inventory: updatedInv, availableBags: updatedInv[searchBloodGroup] || 0 };
      }
      return b;
    }));
    setAdminSelectedBank(prev => ({ ...prev, inventory: updatedInv }));
    triggerToast("Inventory adjusted!", "success");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setLoggedInDonor(null);
    setAuthMode('select');
    setSelectedResultCard(null);
    setAdminSelectedBank(null);
    triggerToast("Signed out successfully.", "info");
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B0F17]/90 border-b border-slate-200 dark:border-slate-850 shadow-sm backdrop-blur-md transition-colors select-none">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <button 
            onClick={() => {
              setIsLoggedIn(false);
              setUserRole(null);
              setAuthMode('select');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group text-left cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-655 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-4.5 h-4.5 text-white fill-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 bg-clip-text text-transparent">
                BloodFinder
              </span>
              <span className="hidden md:inline-block ml-2 text-[9px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded font-mono">
                EMERGENCY DECK v2
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          {!isLoggedIn && (
            <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-455 dark:text-slate-400">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-red-500 transition-colors cursor-pointer">Home</button>
              <button onClick={() => scrollToRef(bentoRef)} className="hover:text-red-500 transition-colors cursor-pointer">Features</button>
              <button onClick={() => scrollToRef(worksRef)} className="hover:text-red-500 transition-colors cursor-pointer">Workflow</button>
              <button onClick={() => scrollToRef(registerSectionRef)} className="hover:text-red-500 transition-colors cursor-pointer">Enroll</button>
              
              <button 
                onClick={() => {
                  setUserRole('searcher');
                  setIsLoggedIn(true);
                  triggerToast("Emergency search portal active!", "success");
                }}
                className="flex items-center gap-1 hover:text-red-505 transition-colors cursor-pointer text-red-550 dark:text-red-400">
                <Search className="w-3.5 h-3.5" />
                Active Radar Search
              </button>
            </nav>
          )}

          {/* Right Panel Header */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400">
                  Dashboard: <span className="capitalize font-black text-red-500 dark:text-red-400">{userRole === 'searcher' ? 'Searcher' : userRole}</span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-xs bg-gradient-to-r from-red-655 to-red-555 hover:from-red-500 hover:to-red-650 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-md shadow-red-500/10 transition-all cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => scrollToRef(loginSectionRef)}
                className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 font-extrabold px-3.5 py-1.5 rounded-lg text-slate-755 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-red-500" />
                Access Portals
              </button>
            )}

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-505 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Global Toast Alerts */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-xl flex items-center gap-2 max-w-sm animate-in slide-in-from-bottom-5 duration-200 bg-white dark:bg-[#111625] border-slate-250 dark:border-slate-800 transition-colors">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 animate-ping ${
            toast.type === 'error' ? 'bg-red-500' : toast.type === 'warning' ? 'bg-amber-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
          }`} />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-normal font-sans">{toast.message}</p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🚀 ENTRY STATE: ELITE VISUAL EMERGENCY CONSOLE AND STEPS */}
      {/* ======================================================== */}
      {!isLoggedIn ? (
        <div className="space-y-24">
                  {/* A. COMMAND CONSOLE HERO & ACTIVE DISPATCH RADAR */}
          <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100/70 to-white dark:from-slate-900 dark:via-[#0B0F17] dark:to-[#0B0F17] py-16 md:py-28 select-none transition-colors border-b border-slate-200/60 dark:border-slate-850/30">
            
            {/* Background vector visuals */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/5 dark:from-red-900/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#0B0F17] to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              
              {/* Left Column: Command Console HUD */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-black tracking-wider text-red-650 dark:text-red-400 uppercase font-mono animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Live Emergency Response System Active
                </span>

                <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight leading-[1.05] text-slate-900 dark:text-white transition-colors">
                  Connecting Drops. <br />
                  <span className="bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                    Securing Lives.
                  </span>
                </h1>

                <p className="text-slate-650 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                  An advanced coordinate-based voluntary blood donor mapping registry and institutional stock repository console. Search and match nearby resources within seconds.
                </p>

                {/* Primary console action triggers */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-3">
                  
                  {/* SOS RADAR SEARCH TRIGGER */}
                  <button
                    onClick={() => {
                      setUserRole('searcher');
                      setIsLoggedIn(true);
                      triggerToast("Emergency search portal active!", "success");
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-650 to-red-500 hover:from-red-555 hover:to-red-600 text-white font-black text-xs rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/35 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider">
                    <Search className="w-4.5 h-4.5" />
                    SOS Radar Lookup (No Login)
                  </button>

                  {/* STEP WIZARD QUICK REGISTER */}
                  <button
                    onClick={() => scrollToRef(registerSectionRef)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs rounded-xl shadow-sm hover:shadow transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider">
                    <User className="w-4.5 h-4.5" />
                    Join Registry
                  </button>

                </div>

              </div>

              {/* Right Column: Active Dispatch Radar Ticker */}
              <div className="lg:col-span-5 flex justify-center select-none font-mono">
                <div className="w-full max-w-sm bg-white dark:bg-[#111625]/65 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden transition-colors">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                      ACTIVE RADAR DISPATCH STREAM
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>

                  {/* Pulsing visual radar grid */}
                  <div className="h-28 flex items-center justify-center relative bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/60 mb-4 overflow-hidden">
                    <div className="absolute w-20 h-20 rounded-full border border-red-500/10 animate-ping" style={{ animationDuration: '4s' }} />
                    <div className="absolute w-12 h-12 rounded-full border border-red-500/20" />
                    <div className="absolute w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    {/* Simulated scanning sweeper line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-t from-red-500/40 to-transparent origin-bottom rotate-45 animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="absolute bottom-2 right-3 text-[8.5px] font-bold text-slate-500 dark:text-slate-400">RADAR ACTIVE: BGL-GRID</span>
                  </div>

                  {/* Real-time Ticking simulated log elements */}
                  <div className="space-y-2.5">
                    {radarLogs.map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800/50 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="text-red-500 dark:text-red-400 font-bold">▶</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{log.text}</p>
                          <span className="text-[8.5px] text-slate-500 dark:text-slate-400">{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* B. SLATE TERMINAL COUNTER TERMINALS */}
          <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-20 select-none">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              
              {[
                { label: "Donors Registered", val: localDonors.length },
                { label: "Available Donors", val: localDonors.filter(d => d.isAvailable).length },
                { label: "Blood Groups", val: 8 },
                { label: "Blood Banks", val: localBanks.length }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-[#111625] border border-slate-250 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg border-t-2 border-t-red-500/70 transition-colors text-center">
                  <span className="block font-mono text-3xl font-black text-slate-900 dark:text-white mb-1">
                    {stat.val}
                  </span>
                  <span className="block text-[9.5px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-normal">
                    {stat.label}
                  </span>
                </div>
              ))}

            </div>
          </div>

          {/* C. BENTO GRID - WHY BLOODCONNECT PLATFORM PILLARS */}
          <section ref={bentoRef} className="max-w-6xl mx-auto px-4 py-8 space-y-12">
            
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight">
                Emergency Platform Pillars
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
                BloodFinder operates on clinical accuracy, instant radial geofencing, and immediate communication.
              </p>
            </div>

            {/* Asymmetric Bento Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Box 1: Large double-width bento card */}
              <div className="md:col-span-8 bg-gradient-to-tr from-white to-slate-50 dark:from-[#111625] dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-red-500/20 transition-all flex flex-col justify-between items-start group">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
                    <Radio className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Coordinate-Based Radial geofencing</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-xl">
                    Our platform computes instant Haversine formulas around matching latitudes/longitudes in Bangalore. It isolates available peer donors and repository bags within a customizable range (1km - 25km), saving precious coordinate transit time in high-risk scenarios.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">LATENCY ➔ SUB-SEC</span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">PERIMETER ➔ GEOFENCED</span>
                </div>
              </div>

              {/* Box 2: Standard bento card */}
              <div className="md:col-span-4 bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-red-500/20 transition-all flex flex-col justify-between items-start group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-650 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">Clinical Verification</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    Every volunteer donor registers with explicit medical indicators, age validations, and date picker tracking of donor intervals to maximize recipient safety.
                  </p>
                </div>
                <span className="block text-[9px] font-mono font-bold text-emerald-600 mt-4 uppercase">Verified Medical Checks</span>
              </div>

              {/* Box 3: Standard bento card */}
              <div className="md:col-span-4 bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-red-500/20 transition-all flex flex-col justify-between items-start group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">Manual Map presets</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    Skip coordinate entry geocodes with pre-calibrated landmark sectors around MG Road, Indiranagar, and Kengeri coordinates.
                  </p>
                </div>
                <span className="block text-[9px] font-mono font-bold text-blue-600 mt-4 uppercase">Simulated Geocodes Synced</span>
              </div>

              {/* Box 4: Large double-width bento card */}
              <div className="md:col-span-8 bg-gradient-to-tr from-white to-slate-50 dark:from-[#111625] dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-red-500/20 transition-all flex flex-col justify-between items-start group">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Voice Call & Route dispatch</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-xl">
                    Coordinate transfers in seconds. Every search match opens a dedicated, frosted control card letting families trigger direct voice calls to volunteer donors or repository administrators, and lock Google Maps directions in one click.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">ROUTING ➔ GOOGLE MAPS</span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">DISPATCH ➔ DIRECT CALL</span>
                </div>
              </div>

            </div>
          </section>

          {/* D. WORKFLOW PROGRESS TIMELINE SECTION */}
          <section ref={worksRef} className="max-w-6xl mx-auto px-4 py-8 space-y-12">
            
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight">
                System Workflow
              </h2>
              <p className="text-slate-500 dark:text-slate-450 text-xs md:text-sm leading-relaxed font-medium">
                Simplifying donor tracking and emergency matching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch select-none">
              
              {/* Step 1 */}
              <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3 transition-colors relative">
                <div className="absolute top-4 left-4 w-7 h-7 bg-red-500 text-white font-extrabold text-xs rounded-lg flex items-center justify-center">01</div>
                <div className="pl-9 space-y-2">
                  <h3 className="font-display font-extrabold text-sm text-slate-850 dark:text-white">Registry Onboarding</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Volunteers register in three clinical steps, detailing age limits, blood categories, cities, and health questionnaire flags.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3 transition-colors relative">
                <div className="absolute top-4 left-4 w-7 h-7 bg-red-500 text-white font-extrabold text-xs rounded-lg flex items-center justify-center">02</div>
                <div className="pl-9 space-y-2">
                  <h3 className="font-display font-extrabold text-sm text-slate-850 dark:text-white">Radius Mapping Search</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Searchers query specific blood categories. SVG canvas dynamically locks coordinate pin beacons and overlays boundary radii.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3 transition-colors relative">
                <div className="absolute top-4 left-4 w-7 h-7 bg-red-500 text-white font-extrabold text-xs rounded-lg flex items-center justify-center">03</div>
                <div className="pl-9 space-y-2">
                  <h3 className="font-display font-extrabold text-sm text-slate-850 dark:text-white">Dispatch & Tracking</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Inspect profile health histories. Call voluntary donor coordinates or trigger Google map routes to banks in one click.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* E. CLINICAL STEPPED REGISTRATION WIZARD ("BECOME A DONOR") */}
          <section ref={registerSectionRef} className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white dark:bg-[#111625] border border-slate-250 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl transition-all relative overflow-hidden">
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-655 to-red-500" />

              {/* Header Title */}
              <div className="text-center space-y-2 mb-8">
                <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Become a Registry Donor</h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Join our geofenced community coordinates registry in three simple steps.</p>
              </div>

              {/* Wizard Steps indicator tabs */}
              <div className="grid grid-cols-3 gap-2 mb-8 text-center select-none font-mono">
                {[
                  { step: 1, label: "01. Donor Profile" },
                  { step: 2, label: "02. Location & Credentials" },
                  { step: 3, label: "03. Health & Consent" }
                ].map((item) => (
                  <div key={item.step} className="space-y-2">
                    <span className={`block text-[9px] font-black uppercase tracking-wider ${
                      registrationStep >= item.step ? 'text-red-500 dark:text-red-400' : 'text-slate-400'
                    }`}>
                      {item.label}
                    </span>
                    <div className={`h-1.5 rounded-full transition-all ${
                      registrationStep >= item.step ? 'bg-red-500' : 'bg-slate-100 dark:bg-slate-850'
                    }`} />
                  </div>
                ))}
              </div>

              {/* Form Content steps - Restructured to place core fields in step 1 */}
              <form onSubmit={handleDonorRegister} className="space-y-6">
                
                {/* ==================== STEP 1: CORE DONOR PROFILE ==================== */}
                {registrationStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Full Name *</label>
                      <input 
                        type="text" required
                        value={donorRegisterForm.name}
                        onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, name: e.target.value })}
                        className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${
                          validationErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                        } rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-red-500 transition-colors`}
                        placeholder="Enter your full name"
                      />
                      {validationErrors.name && <p className="text-[10px] font-bold text-red-500 mt-1">{validationErrors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Age */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Age *</label>
                        <input 
                          type="number" required
                          value={donorRegisterForm.age}
                          onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, age: e.target.value })}
                          className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${
                            validationErrors.age ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                          } rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-red-500 transition-colors`}
                          placeholder="e.g. 25"
                        />
                        {validationErrors.age && <p className="text-[10px] font-bold text-red-500 mt-1">{validationErrors.age}</p>}
                      </div>

                      {/* Blood Group */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Blood Group *</label>
                        <select
                          value={donorRegisterForm.bloodGroup}
                          onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, bloodGroup: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-red-500 transition-colors">
                          {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(gp => (
                            <option key={gp} value={gp}>{gp}</option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Contact Number */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Contact Number *</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs text-slate-500 font-bold font-mono">+91</span>
                        <input 
                          type="tel" required
                          value={donorRegisterForm.phone}
                          onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, phone: e.target.value })}
                          className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${
                            validationErrors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                          } rounded-xl pl-11 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-red-500 transition-colors font-mono`}
                          placeholder="10-digit mobile number"
                        />
                      </div>
                      {validationErrors.phone ? (
                        <p className="text-[10px] font-bold text-red-500 mt-1">{validationErrors.phone}</p>
                      ) : (
                        <span className="block text-[9px] text-slate-400 mt-0.5">Please provide an active mobile number for coordinate voice call matches.</span>
                      )}
                    </div>

                    <button 
                      type="button"
                      onClick={handleWizardNext}
                      className="w-full py-2.5 bg-red-500 hover:bg-red-650 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-600/10 transition-all flex items-center justify-center gap-1 uppercase tracking-wider cursor-pointer font-mono">
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </button>

                  </div>
                )}

                {/* ==================== STEP 2: LOCATION & CREDENTIALS ==================== */}
                {registrationStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* City & State Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* City */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">City *</label>
                        <input 
                          type="text" required
                          value={donorRegisterForm.city}
                          onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, city: e.target.value })}
                          className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${
                            validationErrors.city ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                          } rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-red-500 transition-colors`}
                          placeholder="e.g. Bangalore"
                        />
                        {validationErrors.city && <p className="text-[10px] font-bold text-red-500 mt-1">{validationErrors.city}</p>}
                      </div>

                      {/* State */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">State *</label>
                        <input 
                          type="text" required
                          value={donorRegisterForm.state}
                          onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, state: e.target.value })}
                          className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${
                            validationErrors.state ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                          } rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-red-500 transition-colors`}
                          placeholder="e.g. Karnataka"
                        />
                        {validationErrors.state && <p className="text-[10px] font-bold text-red-500 mt-1">{validationErrors.state}</p>}
                      </div>

                    </div>

                    {/* Email & Password Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Email Address *</label>
                        <input 
                          type="email" required
                          value={donorRegisterForm.email}
                          onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, email: e.target.value })}
                          className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${
                            validationErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                          } rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-red-500 transition-colors`}
                          placeholder="john@example.com"
                        />
                        {validationErrors.email && <p className="text-[10px] font-bold text-red-500 mt-1">{validationErrors.email}</p>}
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Password *</label>
                        <input 
                          type="password" required
                          value={donorRegisterForm.password}
                          onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, password: e.target.value })}
                          className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${
                            validationErrors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                          } rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-red-500 transition-colors`}
                          placeholder="Min 6 characters"
                        />
                        {validationErrors.password && <p className="text-[10px] font-bold text-red-500 mt-1">{validationErrors.password}</p>}
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={handleWizardBack}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer font-mono">
                        Back
                      </button>
                      <button 
                        type="button"
                        onClick={handleWizardNext}
                        className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer font-mono">
                        Next Step
                      </button>
                    </div>

                  </div>
                )}

                {/* ==================== STEP 3: HEALTH & CONSENT ==================== */}
                {registrationStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Collapsible screening checklist */}
                    <div className="border border-amber-200 dark:border-amber-900/50 rounded-xl overflow-hidden shadow-sm animate-in fade-in">
                      <button 
                        type="button"
                        onClick={() => setQuestionnaireCollapsed(!questionnaireCollapsed)}
                        className="w-full text-left p-3.5 bg-amber-500/[0.04] dark:bg-amber-500/[0.02] border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between font-semibold text-xs text-amber-700 dark:text-amber-400 cursor-pointer">
                        <span className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Donor Eligibility Questionnaire
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${questionnaireCollapsed ? '' : 'rotate-180'}`} />
                      </button>

                      {!questionnaireCollapsed && (
                        <div className="p-4 bg-amber-500/[0.01] space-y-3 animate-in slide-in-from-top-2 duration-200">
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-normal">
                            Have you ever been diagnosed with, or had symptoms of, any of the following? (Select all that apply)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                            {[
                              'HIV / AIDS',
                              'Hepatitis B / C',
                              'Blood Cancer',
                              'Syphilis',
                              'Severe Heart Disease',
                              'Infectious Disease'
                            ].map((disease) => {
                              const checked = donorRegisterForm.eligibilityFlags.includes(disease);
                              return (
                                <label key={disease} className="flex items-center gap-2 select-none cursor-pointer">
                                  <input 
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleCheckboxChange(disease)}
                                    className="rounded border-slate-300 dark:border-slate-800 text-red-500 focus:ring-0 accent-red-500 cursor-pointer"
                                  />
                                  <span className={checked ? 'text-amber-500 font-bold font-mono' : ''}>{disease}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Last Donated Date */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Last Donated Date</label>
                      <input 
                        type="date"
                        value={donorRegisterForm.lastDonatedDate}
                        onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, lastDonatedDate: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-red-500 transition-colors font-mono"
                      />
                    </div>

                    {/* General notes */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">Medical History & General Health Notes</label>
                      <textarea 
                        value={donorRegisterForm.medicalHistory}
                        onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, medicalHistory: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-red-500 transition-colors h-20 resize-none"
                        placeholder="Any general notes (allergies, chronic health checks, taking medications)"
                      />
                    </div>

                    {/* Live status and Consent */}
                    <div className="space-y-4 pt-2">
                      
                      {/* Available to Donate live toggle */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setDonorRegisterForm({ ...donorRegisterForm, isAvailable: !donorRegisterForm.isAvailable })}
                          className={`w-12 h-6.5 rounded-full relative flex items-center transition-colors cursor-pointer ${
                            donorRegisterForm.isAvailable ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-800'
                          }`}>
                          <div className={`w-5 h-5 rounded-full bg-white shadow absolute transition-all ${
                            donorRegisterForm.isAvailable ? 'left-[25px]' : 'left-[3px]'
                          }`} />
                        </button>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                          Available to Donate Live Immediately
                        </span>
                      </div>

                      {/* Consent Checkbox */}
                      <div className="space-y-1">
                        <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={donorRegisterForm.consentChecked}
                            onChange={(e) => setDonorRegisterForm({ ...donorRegisterForm, consentChecked: e.target.checked })}
                            className="rounded border-slate-300 dark:border-slate-800 text-red-500 focus:ring-0 cursor-pointer mt-0.5 accent-red-500"
                          />
                          <span>I consent to being contacted for blood donation emergencies *</span>
                        </label>
                        {validationErrors.consent && <p className="text-[10px] font-bold text-red-500 mt-1">{validationErrors.consent}</p>}
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={handleWizardBack}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-355 font-extrabold text-xs rounded-xl cursor-pointer font-mono">
                        Back
                      </button>
                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-red-655 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/10 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 font-mono">
                        <Check className="w-4 h-4" />
                        Register Now
                      </button>
                    </div>

                  </div>
                )}

              </form>

            </div>
          </section>

          {/* F. LOG IN ACCESS FORALS */}
          <section ref={loginSectionRef} className="max-w-md mx-auto px-4 py-8">
            <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg overflow-hidden transition-colors">
              
              <div className="bg-slate-50 dark:bg-slate-900/60 p-5 text-center border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-405 dark:text-slate-505 uppercase tracking-wider font-mono">Select Access Pathway</h3>
              </div>

              {authMode === 'select' && (
                <div className="p-5 space-y-4">
                  {/* Emergency Patient lookup */}
                  <button
                    onClick={() => {
                      setUserRole('searcher');
                      setIsLoggedIn(true);
                      triggerToast("Emergency search portal active!", "success");
                    }}
                    className="w-full text-left p-4 rounded-xl border border-red-200 dark:border-red-900/50 hover:border-red-400 bg-red-500/[0.01] hover:bg-red-500/[0.04] group transition-all cursor-pointer">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-red-500 tracking-wider font-mono">
                      <span>Emergency Search</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-855 dark:text-slate-200 mt-1">Locate Blood Instantly (No Login)</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-sans">
                      Instant access to local donor contacts and blood bank inventories within a configurable radius.
                    </p>
                  </button>

                  {/* Donor login */}
                  <button
                    onClick={() => {
                      setActiveLoginType('donor');
                      setAuthMode('login');
                    }}
                    className="w-full text-left p-4 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 group transition-all cursor-pointer">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 tracking-wider font-mono">
                      <span>Voluntary Donor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-205 mt-1">Sign In to Switch Availability</h4>
                    <p className="text-[11px] text-slate-505 mt-1">
                      Log in to toggle your status between Available and Busy.
                    </p>
                  </button>

                  {/* Admin login */}
                  <button
                    onClick={() => {
                      setActiveLoginType('admin');
                      setAuthMode('login');
                    }}
                    className="w-full text-left p-4 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 group transition-all cursor-pointer">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-455 tracking-wider font-mono">
                      <span>Hospital Admin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-205 mt-1">Manage Repository Stock</h4>
                    <p className="text-[11px] text-slate-550 mt-1">
                      Log in to register blood banks and edit stock levels.
                    </p>
                  </button>
                </div>
              )}

              {/* Login form */}
              {authMode === 'login' && (
                <div className="p-5 space-y-4 font-sans">
                  <div className="flex justify-between items-center text-xs">
                    <button onClick={() => setAuthMode('select')} className="text-slate-400 hover:text-slate-655 cursor-pointer">
                      ← Back
                    </button>
                    <span className="font-mono font-bold uppercase text-[10px] text-slate-400">
                      {activeLoginType === 'donor' ? 'Donor Access' : 'Admin Access'}
                    </span>
                  </div>

                  {/* DEMO ACC AUTOFILL CLICKS */}
                  <div className="p-3 bg-red-500/[0.02] border border-red-500/10 rounded-lg">
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <span className="block text-[8px] font-black text-red-500 uppercase font-mono">Demo Credentials (Autofill)</span>
                        <span className="text-[10px] text-slate-450 font-mono">
                          {activeLoginType === 'donor' ? 'amit@example.com' : 'admin@hemolink.org'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={activeLoginType === 'donor' ? triggerDonorAutofill : triggerAdminAutofill}
                        className="px-2.5 py-1 bg-red-500 hover:bg-red-650 text-white font-bold text-[9px] rounded cursor-pointer">
                        Autofill
                      </button>
                    </div>
                  </div>

                  <form onSubmit={activeLoginType === 'donor' ? handleDonorLogin : handleAdminLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1 uppercase">Email Address</label>
                      <input 
                        type="email" required
                        value={activeLoginType === 'donor' ? donorLoginForm.email : adminLoginForm.email}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeLoginType === 'donor') setDonorLoginForm({ ...donorLoginForm, email: val });
                          else setAdminLoginForm({ ...adminLoginForm, email: val });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-750 dark:text-slate-205 outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1 uppercase">Password</label>
                      <input 
                        type="password" required
                        value={activeLoginType === 'donor' ? donorLoginForm.password : adminLoginForm.password}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeLoginType === 'donor') setDonorLoginForm({ ...donorLoginForm, password: val });
                          else setAdminLoginForm({ ...adminLoginForm, password: val });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-750 dark:text-slate-205 outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    {(activeLoginType === 'donor' ? donorLoginError : adminLoginError) && (
                      <p className="text-xs text-red-655 bg-red-50 dark:bg-red-955/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900 font-bold font-mono">
                        ⚠️ {activeLoginType === 'donor' ? donorLoginError : adminLoginError}
                      </p>
                    )}

                    <button type="submit" className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer">
                      Sign In
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>

        </div>
      ) : (
        // ========================================================
        // 🏡 ACTIVE DASHBOARDS (LOGGED IN)
        // ========================================================
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* ========================================== */}
          {/* A. PATIENT EMERGENCY SEARCHER HUB */}
          {/* ========================================== */}
          {userRole === 'searcher' && (
            <div className="space-y-6">
              
              {/* Emergency active alert banner */}
              <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[9px] rounded font-mono">
                    SOS BROADCAST
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-red-200">
                    Urgent request: O- Negative supply needed at City Central Blood Bank.
                  </p>
                </div>
                <button 
                  onClick={() => triggerToast("Acknowledged! Simulation response triggered.", "info")}
                  className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg cursor-pointer">
                  Respond
                </button>
              </div>

              {/* Central search grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Search controller filters */}
                <div className="lg:col-span-4 bg-white dark:bg-[#111625] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors font-mono">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Blood Group Required</label>
                    <div className="grid grid-cols-4 gap-1.5 font-mono">
                      {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((group) => (
                        <button
                          key={group}
                          onClick={() => setSearchBloodGroup(group)}
                          className={`py-2 px-1 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                            searchBloodGroup === group 
                              ? 'bg-red-500 border-red-400 text-white shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-805 text-slate-600 dark:text-slate-400 hover:border-slate-350'
                          }`}>
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compatible Helper Fallbacks */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/40 dark:border-slate-800/80 text-[11px] space-y-1">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">🧬 Compatible blood fallbacks</span>
                    <div className="flex flex-wrap gap-1 font-sans">
                      {GET_COMPATIBLE_TYPES(searchBloodGroup).map(gp => (
                        <span key={gp} className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${gp === searchBloodGroup ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-550'}`}>
                          {gp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Radius slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase">
                      <span>Search Perimeter</span>
                      <span className="text-red-500 dark:text-red-400 font-mono text-sm">{searchRadius} km</span>
                    </div>
                    <input
                      type="range" min="1" max="25" value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      className="w-full accent-red-500 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* GPS Locator */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="block text-xs font-bold text-slate-400 mb-2 uppercase">Current Location</span>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {locationName}
                        </span>
                        <button onClick={simulateGPSLocation} className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold px-2 py-0.5 rounded cursor-pointer">
                          GPS Sync
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 font-mono">Lat: {userLocation.latitude.toFixed(4)} | Lng: {userLocation.longitude.toFixed(4)}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mt-2.5">
                      <button onClick={() => presetLocation("Central Bangalore", 12.9716, 77.5946)} className="py-1 px-0.5 text-[9px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded cursor-pointer font-mono font-mono">MG Road</button>
                      <button onClick={() => presetLocation("Indiranagar", 12.9784, 77.6408)} className="py-1 px-0.5 text-[9px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded cursor-pointer font-mono font-mono">Indiranagar</button>
                      <button onClick={() => presetLocation("Kengeri Node", 12.9099, 77.4851)} className="py-1 px-0.5 text-[9px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded cursor-pointer font-mono font-mono">Kengeri</button>
                    </div>
                  </div>
                </div>

                {/* Map & Listings Result Panel */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Local coordinate visual map */}
                  <InteractiveMap 
                    userLat={userLocation.latitude} 
                    userLng={userLocation.longitude} 
                    radius={searchRadius} 
                    donors={resultsDonors} 
                    bloodBanks={resultsBanks}
                    onSelectSource={(source) => setSelectedResultCard(source)}
                  />

                  {/* Matches filter tabs */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex gap-1.5">
                      {['all', 'banks', 'donors'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSearchType(type)}
                          className={`px-3 py-1 text-xs font-bold rounded-full capitalize cursor-pointer transition-all ${
                            searchType === type 
                              ? 'bg-red-500/10 text-red-500 border border-red-505/25 font-extrabold' 
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-700'
                          }`}>
                          {type === 'all' ? 'All Matches' : type === 'banks' ? 'Banks' : 'Volunteers'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Listings cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searching ? (
                      <div className="col-span-2 py-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5 font-mono">
                        <Compass className="w-6 h-6 text-red-500 animate-spin" />
                        <span>Scanning databases for nearby supplies...</span>
                      </div>
                    ) : (
                      <>
                        {/* Institutional Blood Banks results */}
                        {(searchType === 'all' || searchType === 'banks') && resultsBanks.map((bank) => {
                          return (
                            <div 
                              key={`bank-${bank.id}`}
                              onClick={() => setSelectedResultCard({ ...bank, type: 'bloodbank' })}
                              className="p-4 bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-all flex flex-col justify-between cursor-pointer select-none group">
                              <div>
                                <div className="flex justify-between items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 bg-red-500/10 text-[9px] font-bold uppercase text-red-550 border border-red-500/20 rounded font-mono">
                                    Blood Bank
                                  </span>
                                  <span className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-mono text-slate-750 dark:text-slate-355 font-bold border border-slate-200/50 dark:border-slate-800">
                                    {bank.availableBags} Bags Available
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 group-hover:text-red-500 transition-colors">{bank.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">📍 {bank.address}</p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-450 dark:text-slate-400 font-mono">
                                <span>Distance: <b className="text-slate-700 dark:text-slate-300">{bank.distance} km</b></span>
                                <span className="text-[10px] text-red-555 font-bold hover:underline flex items-center gap-0.5">
                                  inspect ➔
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Voluntary Donors results */}
                        {(searchType === 'all' || searchType === 'donors') && resultsDonors.map((donor) => {
                          return (
                            <div 
                              key={`donor-${donor.id}`}
                              onClick={() => setSelectedResultCard({ ...donor, type: 'donor' })}
                              className="p-4 bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-all flex flex-col justify-between cursor-pointer select-none group">
                              <div>
                                <div className="flex justify-between items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-[9px] font-bold uppercase text-emerald-600 border border-emerald-500/20 rounded font-mono">
                                    Donor
                                  </span>
                                  <span className="text-xs bg-red-500 text-white font-black px-2 py-0.5 rounded-full font-mono">
                                    {donor.bloodGroup}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-855 dark:text-slate-100 group-hover:text-emerald-555 transition-colors">{donor.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Active & Available</span>
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/85 flex items-center justify-between text-[11px] text-slate-455 dark:text-slate-400 font-mono">
                                <span>Distance: <b className="text-slate-700 dark:text-slate-300">{donor.distance} km</b></span>
                                <span className="text-[10px] text-red-555 font-bold hover:underline flex items-center gap-0.5 font-mono">
                                  inspect ➔
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* ✨ MODAL DETAILS: INSPECT RESULT OVERLAY */}
              {selectedResultCard && (
                <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-200 font-sans transition-colors">
                    
                    <button onClick={() => setSelectedResultCard(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-2.5 ${
                      selectedResultCard.type === 'bloodbank' ? 'bg-red-505/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    }`}>
                      {selectedResultCard.type === 'bloodbank' ? 'Blood Bank' : 'Emergency Voluntary Donor'}
                    </span>

                    <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 font-display">{selectedResultCard.name}</h3>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 font-medium font-mono">
                      📍 {selectedResultCard.address || `${selectedResultCard.city || 'Bangalore City'}, ${selectedResultCard.state || 'Karnataka'}`}
                    </p>

                    {/* Donor expanded medical indicators */}
                    {selectedResultCard.type === 'donor' && (
                      <div className="my-5 space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 font-mono text-xs">
                        
                        <span className="block text-[9px] text-slate-455 dark:text-slate-550 font-black uppercase tracking-wider mb-2">Registered Profile (Verified)</span>
                        
                        <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-355">
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Age</span>
                            <b>{selectedResultCard.age || 25} Years Old</b>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Blood Category</span>
                            <b className="text-red-505 dark:text-red-400">{selectedResultCard.bloodGroup}</b>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Last Donated Date</span>
                            <b>{selectedResultCard.lastDonatedDate || 'Never / No date'}</b>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Emergency Consent</span>
                            <b className="text-emerald-605">ACTIVE</b>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 mt-2.5">
                          <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Medical/General notes</span>
                          <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 leading-normal italic">
                            "{selectedResultCard.medicalHistory || 'None provided'}"
                          </p>
                        </div>

                        {/* Screening indicators */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 mt-2.5">
                          <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Eligibility Screening</span>
                          {selectedResultCard.eligibilityFlags && selectedResultCard.eligibilityFlags.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedResultCard.eligibilityFlags.map(item => (
                                <span key={item} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold rounded font-mono">
                                  ⚠️ {item}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 text-[9px] font-bold rounded">
                              ✓ No chronic conditions flagged
                            </span>
                          )}
                        </div>

                      </div>
                    )}

                    {/* Inventory details for repositories */}
                    {selectedResultCard.type === 'bloodbank' && (
                      <div className="my-5 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 font-mono">
                        <span className="block text-[9px] text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wider mb-3 font-mono">Available stocks (Bags)</span>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {Object.entries(selectedResultCard.inventory || {}).map(([gp, bags]) => (
                            <div key={gp} className={`p-2 rounded-lg border ${gp === searchBloodGroup ? 'bg-red-500/10 border-red-300 text-red-750 dark:text-red-400' : 'bg-white dark:bg-[#111625] border-slate-200 dark:border-slate-800'}`}>
                              <span className="block text-[10px] text-slate-455 dark:text-slate-550">{gp}</span>
                              <b className={`text-xs ${bags < 5 ? 'text-amber-550 font-black' : 'text-slate-700 dark:text-slate-200'}`}>{bags} bags</b>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                      <div>
                        <span className="block text-[9px] text-slate-400 dark:text-slate-555 font-bold uppercase mb-1.5">Voice Call dispatch</span>
                        <a 
                          href={`tel:${selectedResultCard.phone || selectedResultCard.contactNumber}`}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-red-650 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-extrabold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-500/10">
                          <Phone className="w-4 h-4 text-white animate-pulse" />
                          Call dispatch
                        </a>
                      </div>

                      <div>
                        <span className="block text-[9px] text-slate-400 dark:text-slate-555 font-bold uppercase mb-1.5">Navigation Router</span>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedResultCard.latitude},${selectedResultCard.longitude}`}
                          target="_blank" rel="noreferrer"
                          className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer hover:border-slate-350">
                          <Navigation className="w-4 h-4 text-red-505" />
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
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 font-mono">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                  <User className="w-5.5 h-5.5 text-red-500 animate-pulse" />
                  Voluntary Donor Dashboard
                </h2>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded font-bold text-slate-505">PEER ACTIVE</span>
              </div>

              {/* Status toggler card */}
              <div className="bg-white dark:bg-[#111625] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                
                <div className="p-4 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                  <div>
                    <span className={`text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                      loggedInDonor.isAvailable ? 'text-emerald-500 font-extrabold' : 'text-slate-455 dark:text-slate-500'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${loggedInDonor.isAvailable ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                      Live Status: {loggedInDonor.isAvailable ? 'AVAILABLE IMMEDIATELY' : 'OFFLINE / BUSY'}
                    </span>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 leading-relaxed max-w-[300px]">
                      {loggedInDonor.isAvailable 
                        ? 'Your contact number is visible in nearby queries.' 
                        : 'Your profile has been excluded from emergency lookup searches.'}
                    </p>
                  </div>

                  <button
                    onClick={toggleAvailability}
                    className={`w-14 h-8 rounded-full transition-all relative flex items-center cursor-pointer ${
                      loggedInDonor.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-350 dark:bg-slate-800'
                    }`}>
                    <div className={`w-6 h-6 rounded-full bg-white transition-all shadow absolute ${
                      loggedInDonor.isAvailable ? 'left-[31px]' : 'left-[3px]'
                    }`} />
                  </button>
                </div>

                {/* Info summary */}
                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] text-slate-455 uppercase font-bold">Donor Name</span>
                    <p className="text-slate-805 dark:text-slate-200 font-extrabold mt-1 font-sans">{loggedInDonor.name}</p>
                  </div>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] text-slate-455 uppercase font-bold">Blood Category</span>
                    <p className="text-red-500 font-black mt-1 flex items-center gap-1 font-sans font-sans">
                      <Heart className="w-3.5 h-3.5 fill-red-500 animate-pulse" />
                      {loggedInDonor.bloodGroup}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] text-slate-455 uppercase font-bold">Phone Number</span>
                    <p className="text-slate-805 dark:text-slate-200 font-extrabold mt-1 font-sans">{loggedInDonor.phone}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] text-slate-455 uppercase font-bold">Age</span>
                    <p className="text-slate-805 dark:text-slate-200 font-extrabold mt-1 font-sans">{loggedInDonor.age || 25} Years</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] text-slate-455 uppercase font-bold">Location</span>
                    <p className="text-slate-805 dark:text-slate-200 font-extrabold mt-1 font-sans">{loggedInDonor.city || 'Bangalore'}, {loggedInDonor.state || 'Karnataka'}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] text-slate-455 uppercase font-bold">Health Checks</span>
                    <p className="text-emerald-555 font-extrabold mt-1 font-sans">✓ Screened</p>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* C. ADMINISTRATIVE DESK PORTAL */}
          {/* ========================================== */}
          {userRole === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-200 font-mono">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-805 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                    <Landmark className="w-5.5 h-5.5 text-red-500 animate-pulse" />
                    Administrative Repository Desk
                  </h2>
                  <p className="text-xs text-slate-450 dark:text-slate-450 mt-0.5">Manage linked blood repositories and inventory bags.</p>
                </div>
                
                {/* Add Hospital button */}
                <button
                  onClick={() => {
                    setValidationErrors({});
                    setShowAddBankPanel(!showAddBankPanel);
                  }}
                  className="text-xs bg-red-500 hover:bg-red-650 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                  Register Hospital
                </button>
              </div>

              {/* Add Hospital panel */}
              {showAddBankPanel && (
                <div className="bg-white dark:bg-[#111625] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md max-w-xl mx-auto animate-in slide-in-from-top-4 duration-200">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2.5 mb-4 font-mono">
                    <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-255">Register new hospital</h3>
                    <button onClick={() => setShowAddBankPanel(false)} className="text-slate-400 hover:text-slate-650 text-xs cursor-pointer">
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleBankRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-455 dark:text-slate-405 font-bold mb-1 uppercase font-mono">Repository Name</label>
                      <input 
                        type="text" required
                        value={newBankForm.name}
                        onChange={(e) => setNewBankForm({ ...newBankForm, name: e.target.value })}
                        className={`w-full bg-slate-50 dark:bg-slate-900 border ${validationErrors.bankName ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'} rounded-lg px-3 py-2 text-xs outline-none text-slate-750 dark:text-slate-200`}
                      />
                      {validationErrors.bankName && <p className="text-[9px] text-red-550 mt-1">{validationErrors.bankName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-455 dark:text-slate-405 font-bold mb-1 uppercase font-mono">Dispatcher Phone</label>
                        <input 
                          type="tel" required
                          value={newBankForm.contactNumber}
                          onChange={(e) => setNewBankForm({ ...newBankForm, contactNumber: e.target.value })}
                          className={`w-full bg-slate-50 dark:bg-slate-900 border ${validationErrors.bankPhone ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'} rounded-lg px-3 py-2 text-xs outline-none text-slate-750 dark:text-slate-200`}
                        />
                        {validationErrors.bankPhone && <p className="text-[9px] text-red-550 mt-1">{validationErrors.bankPhone}</p>}
                      </div>

                      <div>
                        <label className="block text-xs text-slate-455 dark:text-slate-405 font-bold mb-1 uppercase font-mono">Street Address</label>
                        <input 
                          type="text" required
                          value={newBankForm.address}
                          onChange={(e) => setNewBankForm({ ...newBankForm, address: e.target.value })}
                          className={`w-full bg-slate-50 dark:bg-slate-900 border ${validationErrors.bankAddress ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'} rounded-lg px-3 py-2 text-xs outline-none text-slate-750 dark:text-slate-200`}
                        />
                        {validationErrors.bankAddress && <p className="text-[9px] text-red-550 mt-1">{validationErrors.bankAddress}</p>}
                      </div>
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-red-500 text-white font-bold text-xs rounded-lg transition-all uppercase">
                      Confirm Registration
                    </button>
                  </form>
                </div>
              )}

              {/* hospital inventory rows */}
              <div className="bg-white/70 dark:bg-[#111625]/65 border border-slate-200 dark:border-slate-805 rounded-2xl shadow-sm overflow-hidden transition-colors">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-805 text-[10px] font-black uppercase text-slate-455 tracking-wider font-mono">
                      <th className="p-4">Repository Name</th>
                      <th className="p-4 hidden md:table-cell">Location Address</th>
                      <th className="p-4">Capacity Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                    {(serverOnline ? resultsBanks : localBanks).map((bank) => {
                      const totalBags = Object.values(bank.inventory || {}).reduce((a, b) => a + b, 0);
                      const hasLow = Object.values(bank.inventory || {}).some(b => b < 3);

                      return (
                        <tr key={bank.id} className="hover:bg-slate-50 dark:hover:bg-slate-805/40 transition-colors">
                          <td className="p-4 font-bold text-slate-850 dark:text-slate-100">
                            {bank.name}
                            <span className="block md:hidden text-[9px] text-slate-400 mt-0.5">{bank.address}</span>
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">{bank.address}</td>
                          <td className="p-4 font-mono font-bold">
                            <span className={`inline-flex items-center gap-1 ${hasLow ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'}`}>
                              {totalBags} bags
                              {hasLow && <AlertTriangle className="w-3.5 h-3.5 fill-none animate-pulse" />}
                            </span>
                          </td>
                          <td className="p-4 text-right font-sans">
                            <button
                              onClick={() => setAdminSelectedBank(bank)}
                              className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:border-red-400/50 cursor-pointer text-[10px] font-mono">
                              Manage Inventory
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ✨ MODAL OVERLAY: ADMIN STOCK OVERRIDE */}
              {adminSelectedBank && (
                <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white/95 dark:bg-[#111625]/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-200 font-mono">
                    
                    <button onClick={() => setAdminSelectedBank(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>

                    <div className="border-b border-slate-100 dark:border-slate-850 pb-3 mb-4 font-mono">
                      <span className="text-[9px] font-bold text-slate-455 dark:text-slate-550 uppercase tracking-wider">Inventory management database</span>
                      <h3 className="text-base font-extrabold text-slate-855 dark:text-slate-100 font-display mt-0.5 font-sans">{adminSelectedBank.name}</h3>
                    </div>

                    {/* Stock modifier grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(adminSelectedBank.inventory || {}).map(([group, val]) => {
                        const isLow = val < 5;

                        return (
                          <div 
                            key={`adjust-${group}`}
                            className={`p-2.5 border rounded-xl flex flex-col justify-between items-center text-center bg-slate-50 dark:bg-slate-900/60 ${
                              isLow ? 'border-amber-400' : 'border-slate-200 dark:border-slate-800'
                            }`}>
                            <span className="text-xs font-black text-slate-455 font-mono">{group}</span>
                            
                            <span className={`text-base font-black my-1.5 font-mono ${isLow ? 'text-amber-500 animate-pulse' : 'text-slate-700 dark:text-slate-250'}`}>
                              {val} bags
                            </span>

                            <div className="flex gap-1 w-full font-sans">
                              <button
                                onClick={() => handleUpdateInventory(group, 'dec')}
                                className="flex-1 py-0.5 text-xs font-bold bg-white dark:bg-slate-850 text-slate-555 border border-slate-200 dark:border-slate-750 rounded cursor-pointer">-</button>
                              <button
                                onClick={() => handleUpdateInventory(group, 'inc')}
                                className="flex-1 py-0.5 text-xs font-bold bg-white dark:bg-slate-855 text-slate-555 border border-slate-200 dark:border-slate-750 rounded cursor-pointer">+</button>
                            </div>
                            
                            {isLow && (
                              <span className="text-[8px] text-amber-500 mt-1 uppercase font-bold tracking-tighter font-mono">LOW SUPPLY</span>
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

        </div>
      )}

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-[#0B0F17] py-8 text-xs text-slate-455 mt-10 transition-colors select-none">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-bold text-slate-600 dark:text-slate-400">
              BloodFinder Emergency Network
            </span>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-450 dark:text-slate-500">© 2026 BloodFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
