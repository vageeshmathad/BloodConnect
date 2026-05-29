let sqlite3 = null;
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Database configurations
const SQLITE_DB_PATH = path.join(__dirname, 'bloodfinder.db');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bloodfinder';

export let dbMode = 'sqlite'; // 'mongodb' or 'sqlite'
let sqliteDb = null;

// --- Helper: Haversine Distance Calculation ---
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// --- MongoDB Schemas ---
const DonorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bloodGroup: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true, index: true },
  age: { type: Number, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  lastDonatedDate: { type: String, default: "" },
  medicalHistory: { type: String, default: "" },
  eligibilityFlags: { type: [String], default: [] },
  consentChecked: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const BloodBankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  inventory: {
    'A+': { type: Number, default: 10 },
    'A-': { type: Number, default: 5 },
    'B+': { type: Number, default: 10 },
    'B-': { type: Number, default: 5 },
    'AB+': { type: Number, default: 5 },
    'AB-': { type: Number, default: 2 },
    'O+': { type: Number, default: 15 },
    'O-': { type: Number, default: 8 }
  },
  created_at: { type: Date, default: Date.now }
});

export let MongoDonor = null;
export let MongoBloodBank = null;

// --- Initialize SQLite database helper functions ---
const sqliteRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const sqliteGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const sqliteAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// --- Seed Data Constants ---
const SEED_DONORS = [
  { name: 'Amit Patel', bloodGroup: 'O-', phone: '+91 99001 12233', email: 'amit@example.com', password: 'password123', latitude: 12.9730, longitude: 77.5920, isAvailable: true, age: 25, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '2026-03-01', medicalHistory: 'No chronic diseases', eligibilityFlags: [], consentChecked: true },
  { name: 'Priya Nair', bloodGroup: 'A+', phone: '+91 99002 23344', email: 'priya@example.com', password: 'password123', latitude: 12.9790, longitude: 77.6010, isAvailable: true, age: 28, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '2026-01-15', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true },
  { name: 'Vikram Singh', bloodGroup: 'O-', phone: '+91 99003 34455', email: 'vikram@example.com', password: 'password123', latitude: 12.9620, longitude: 77.5910, isAvailable: false, age: 34, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '2025-12-05', medicalHistory: 'Under medication', eligibilityFlags: [], consentChecked: true },
  { name: 'Sarah D\'Souza', bloodGroup: 'B+', phone: '+91 99004 45566', email: 'sarah@example.com', password: 'password123', latitude: 12.9850, longitude: 77.5750, isAvailable: true, age: 22, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true },
  { name: 'Rajesh Kumar', bloodGroup: 'O-', phone: '+91 99005 56677', email: 'rajesh@example.com', password: 'password123', latitude: 12.9510, longitude: 77.6150, isAvailable: true, age: 41, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '2026-02-28', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true },
  { name: 'Kavita Rao', bloodGroup: 'AB-', phone: '+91 99006 67788', email: 'kavita@example.com', password: 'password123', latitude: 13.0150, longitude: 77.6400, isAvailable: true, age: 27, city: 'Bangalore', state: 'Karnataka', lastDonatedDate: '', medicalHistory: 'None', eligibilityFlags: [], consentChecked: true }
];

const SEED_BLOOD_BANKS = [
  {
    name: 'City Central Blood Bank',
    contactNumber: '+91 98765 43210',
    address: '12, MG Road, Central Business District, Bangalore',
    latitude: 12.9740,
    longitude: 77.5980,
    inventory: { 'A+': 15, 'A-': 5, 'B+': 20, 'B-': 2, 'AB+': 10, 'AB-': 3, 'O+': 14, 'O-': 8 }
  },
  {
    name: 'Metro Red Cross Blood Bank',
    contactNumber: '+91 87654 32109',
    address: '45, Residency Road, Shanthala Nagar, Bangalore',
    latitude: 12.9650,
    longitude: 77.5870,
    inventory: { 'A+': 8, 'A-': 4, 'B+': 9, 'B-': 12, 'AB+': 5, 'AB-': 4, 'O+': 10, 'O-': 2 } // O- low inventory alert
  },
  {
    name: 'St. Jude Emergency Blood Center',
    contactNumber: '+91 76543 21098',
    address: '88, Outer Ring Road, Kalyan Nagar, Bangalore',
    latitude: 13.0020,
    longitude: 77.6200,
    inventory: { 'A+': 22, 'A-': 12, 'B+': 11, 'B-': 6, 'AB+': 12, 'AB-': 8, 'O+': 25, 'O-': 18 }
  },
  {
    name: 'Suburban Healthcare Blood Repository',
    contactNumber: '+91 65432 10987',
    address: '102, Kengeri Main Road, Jnanabharathi, Bangalore',
    latitude: 12.9100,
    longitude: 77.5200,
    inventory: { 'A+': 5, 'A-': 2, 'B+': 6, 'B-': 1, 'AB+': 2, 'AB-': 8, 'O+': 9, 'O-': 5 }
  }
];

// --- Database Connection Initialization ---
export const initDb = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    mongoose.set('strictQuery', false);
    
    // Timeout in 15 seconds to avoid blocking local runs if MongoDB is not present
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000
    });
    
    dbMode = 'mongodb';
    console.log("Successfully connected to MongoDB at:", MONGO_URI);
    
    MongoDonor = mongoose.model('Donor', DonorSchema);
    MongoBloodBank = mongoose.model('BloodBank', BloodBankSchema);
    
    // Seed MongoDB if empty
    const donorCount = await MongoDonor.countDocuments();
    if (donorCount === 0) {
      console.log("MongoDB is empty. Seeding simulated blood finder data...");
      for (const d of SEED_DONORS) {
        const hash = await bcrypt.hash(d.password, 10);
        await MongoDonor.create({
          name: d.name,
          bloodGroup: d.bloodGroup,
          phone: d.phone,
          email: d.email,
          passwordHash: hash,
          latitude: d.latitude,
          longitude: d.longitude,
          isAvailable: d.isAvailable,
          age: d.age,
          city: d.city,
          state: d.state,
          lastDonatedDate: d.lastDonatedDate,
          medicalHistory: d.medicalHistory,
          eligibilityFlags: d.eligibilityFlags,
          consentChecked: d.consentChecked
        });
      }
      for (const b of SEED_BLOOD_BANKS) {
        await MongoBloodBank.create(b);
      }
      console.log("MongoDB seeded successfully!");
    }
  } catch (mongoError) {
    console.warn("MongoDB connection failed or timed out. Falling back to SQLite3.");
    console.warn("Reason:", mongoError.message);
    
    dbMode = 'sqlite';
    await setupSqlite();
  }
};

// --- Setup SQLite Database fallback ---
const setupSqlite = async () => {
  if (!sqlite3) {
    sqlite3 = (await import('sqlite3')).default;
  }
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(SQLITE_DB_PATH, async (err) => {
      if (err) {
        console.error("Failed to connect to local SQLite database:", err.message);
        reject(err);
        return;
      }
      console.log("Connected to local fallback SQLite database at:", SQLITE_DB_PATH);
      
      try {
        // Create donors table
        await sqliteRun(`
          CREATE TABLE IF NOT EXISTS donors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            blood_group TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            is_available INTEGER DEFAULT 1,
            age INTEGER NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            last_donated_date TEXT DEFAULT "",
            medical_history TEXT DEFAULT "",
            eligibility_flags_json TEXT DEFAULT "[]",
            consent_checked INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create blood banks table
        await sqliteRun(`
          CREATE TABLE IF NOT EXISTS blood_banks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_number TEXT NOT NULL,
            address TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            inventory_json TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Seed SQLite if empty
        const donorCheck = await sqliteGet(`SELECT COUNT(*) as count FROM donors`);
        if (donorCheck.count === 0) {
          console.log("SQLite is empty. Seeding simulated blood finder data...");
          for (const d of SEED_DONORS) {
            const hash = await bcrypt.hash(d.password, 10);
            await sqliteRun(`
              INSERT INTO donors (name, blood_group, phone, email, password_hash, latitude, longitude, is_available, age, city, state, last_donated_date, medical_history, eligibility_flags_json, consent_checked)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              d.name,
              d.bloodGroup,
              d.phone,
              d.email,
              hash,
              d.latitude,
              d.longitude,
              d.isAvailable ? 1 : 0,
              d.age,
              d.city,
              d.state,
              d.lastDonatedDate,
              d.medicalHistory,
              JSON.stringify(d.eligibilityFlags),
              d.consentChecked ? 1 : 0
            ]);
          }
          
          for (const b of SEED_BLOOD_BANKS) {
            await sqliteRun(`
              INSERT INTO blood_banks (name, contact_number, address, latitude, longitude, inventory_json)
              VALUES (?, ?, ?, ?, ?, ?)
            `, [b.name, b.contactNumber, b.address, b.latitude, b.longitude, JSON.stringify(b.inventory)]);
          }
          console.log("SQLite database seeded successfully.");
        }
        resolve();
      } catch (tableErr) {
        console.error("Failed to initialize SQLite tables:", tableErr);
        reject(tableErr);
      }
    });
  });
};

// --- DB INTERFACE API: Unified queries that adapt to active database mode ---

export const registerDonor = async (donorData) => {
  const passwordHash = await bcrypt.hash(donorData.password, 10);
  
  if (dbMode === 'mongodb') {
    const existing = await MongoDonor.findOne({ email: donorData.email.toLowerCase() });
    if (existing) throw new Error("A donor with this email already exists.");
    
    return await MongoDonor.create({
      name: donorData.name,
      bloodGroup: donorData.bloodGroup,
      phone: donorData.phone,
      email: donorData.email.toLowerCase(),
      passwordHash,
      latitude: parseFloat(donorData.latitude),
      longitude: parseFloat(donorData.longitude),
      isAvailable: donorData.isAvailable ?? true,
      age: parseInt(donorData.age),
      city: donorData.city,
      state: donorData.state,
      lastDonatedDate: donorData.lastDonatedDate || '',
      medicalHistory: donorData.medicalHistory || '',
      eligibilityFlags: donorData.eligibilityFlags || [],
      consentChecked: donorData.consentChecked ?? false
    });
  } else {
    const existing = await sqliteGet(`SELECT id FROM donors WHERE email = ?`, [donorData.email.toLowerCase()]);
    if (existing) throw new Error("A donor with this email already exists.");
    
    const res = await sqliteRun(`
      INSERT INTO donors (name, blood_group, phone, email, password_hash, latitude, longitude, is_available, age, city, state, last_donated_date, medical_history, eligibility_flags_json, consent_checked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      donorData.name,
      donorData.bloodGroup,
      donorData.phone,
      donorData.email.toLowerCase(),
      passwordHash,
      parseFloat(donorData.latitude),
      parseFloat(donorData.longitude),
      (donorData.isAvailable ?? true) ? 1 : 0,
      parseInt(donorData.age),
      donorData.city,
      donorData.state,
      donorData.lastDonatedDate || '',
      donorData.medicalHistory || '',
      JSON.stringify(donorData.eligibilityFlags || []),
      (donorData.consentChecked ?? false) ? 1 : 0
    ]);
    return { id: res.id, ...donorData };
  }
};

export const loginDonor = async (email, password) => {
  if (dbMode === 'mongodb') {
    const donor = await MongoDonor.findOne({ email: email.toLowerCase() });
    if (!donor) throw new Error("Invalid email or password.");
    const match = await bcrypt.compare(password, donor.passwordHash);
    if (!match) throw new Error("Invalid email or password.");
    return {
      id: donor._id,
      name: donor.name,
      email: donor.email,
      bloodGroup: donor.bloodGroup,
      phone: donor.phone,
      latitude: donor.latitude,
      longitude: donor.longitude,
      isAvailable: donor.isAvailable,
      age: donor.age,
      city: donor.city,
      state: donor.state,
      lastDonatedDate: donor.lastDonatedDate,
      medicalHistory: donor.medicalHistory,
      eligibilityFlags: donor.eligibilityFlags,
      consentChecked: donor.consentChecked
    };
  } else {
    const donor = await sqliteGet(`SELECT * FROM donors WHERE email = ?`, [email.toLowerCase()]);
    if (!donor) throw new Error("Invalid email or password.");
    const match = await bcrypt.compare(password, donor.password_hash);
    if (!match) throw new Error("Invalid email or password.");
    return {
      id: donor.id,
      name: donor.name,
      email: donor.email,
      bloodGroup: donor.blood_group,
      phone: donor.phone,
      latitude: donor.latitude,
      longitude: donor.longitude,
      isAvailable: donor.is_available === 1,
      age: donor.age,
      city: donor.city,
      state: donor.state,
      lastDonatedDate: donor.last_donated_date,
      medicalHistory: donor.medical_history,
      eligibilityFlags: JSON.parse(donor.eligibility_flags_json || '[]'),
      consentChecked: donor.consent_checked === 1
    };
  }
};

export const toggleDonorAvailability = async (email, isAvailable) => {
  if (dbMode === 'mongodb') {
    const donor = await MongoDonor.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isAvailable },
      { new: true }
    );
    if (!donor) throw new Error("Donor profile not found.");
    return donor;
  } else {
    const check = await sqliteGet(`SELECT id FROM donors WHERE email = ?`, [email.toLowerCase()]);
    if (!check) throw new Error("Donor profile not found.");
    await sqliteRun(`UPDATE donors SET is_available = ? WHERE email = ?`, [isAvailable ? 1 : 0, email.toLowerCase()]);
    return { email, isAvailable };
  }
};

export const searchBloodSources = async (bloodGroup, radiusKm, userLat, userLng) => {
  const radius = parseFloat(radiusKm || 10);
  const lat = parseFloat(userLat || 12.9716);
  const lng = parseFloat(userLng || 77.5946);
  
  let donors = [];
  let bloodBanks = [];
  
  if (dbMode === 'mongodb') {
    // Basic index fetch first, then compute Haversine coordinates filter
    // (Alternative: MongoDB $near query if 2dsphere index exists, but standard Haversine ensures identical cross-platform fallback calculations)
    const allDonors = await MongoDonor.find({ bloodGroup, isAvailable: true });
    donors = allDonors.map(d => {
      const distance = getHaversineDistance(lat, lng, d.latitude, d.longitude);
      return {
        id: d._id,
        type: 'donor',
        name: d.name,
        bloodGroup: d.bloodGroup,
        phone: d.phone,
        email: d.email,
        latitude: d.latitude,
        longitude: d.longitude,
        distance: parseFloat(distance.toFixed(2)),
        age: d.age,
        city: d.city,
        state: d.state,
        lastDonatedDate: d.lastDonatedDate,
        medicalHistory: d.medicalHistory,
        eligibilityFlags: d.eligibilityFlags,
        consentChecked: d.consentChecked
      };
    }).filter(d => d.distance <= radius);
    
    const allBanks = await MongoBloodBank.find();
    bloodBanks = allBanks.map(b => {
      const distance = getHaversineDistance(lat, lng, b.latitude, b.longitude);
      return {
        id: b._id,
        type: 'bloodbank',
        name: b.name,
        contactNumber: b.contactNumber,
        address: b.address,
        latitude: b.latitude,
        longitude: b.longitude,
        inventory: b.inventory,
        availableBags: b.inventory[bloodGroup] || 0,
        distance: parseFloat(distance.toFixed(2))
      };
    }).filter(b => b.distance <= radius && b.availableBags > 0);
    
  } else {
    const allDonors = await sqliteAll(`SELECT * FROM donors WHERE blood_group = ? AND is_available = 1`, [bloodGroup]);
    donors = allDonors.map(d => {
      const distance = getHaversineDistance(lat, lng, d.latitude, d.longitude);
      return {
        id: d.id,
        type: 'donor',
        name: d.name,
        bloodGroup: d.blood_group,
        phone: d.phone,
        email: d.email,
        latitude: d.latitude,
        longitude: d.longitude,
        distance: parseFloat(distance.toFixed(2)),
        age: d.age,
        city: d.city,
        state: d.state,
        lastDonatedDate: d.last_donated_date,
        medicalHistory: d.medical_history,
        eligibilityFlags: JSON.parse(d.eligibility_flags_json || '[]'),
        consentChecked: d.consent_checked === 1
      };
    }).filter(d => d.distance <= radius);
    
    const allBanks = await sqliteAll(`SELECT * FROM blood_banks`);
    bloodBanks = allBanks.map(b => {
      const inventory = JSON.parse(b.inventory_json);
      const distance = getHaversineDistance(lat, lng, b.latitude, b.longitude);
      return {
        id: b.id,
        type: 'bloodbank',
        name: b.name,
        contactNumber: b.contact_number,
        address: b.address,
        latitude: b.latitude,
        longitude: b.longitude,
        inventory,
        availableBags: inventory[bloodGroup] || 0,
        distance: parseFloat(distance.toFixed(2))
      };
    }).filter(b => b.distance <= radius && b.availableBags > 0);
  }
  
  // Sort combined results by closest distance first
  return {
    donors: donors.sort((a, b) => a.distance - b.distance),
    bloodBanks: bloodBanks.sort((a, b) => a.distance - b.distance)
  };
};

export const registerBloodBank = async (bankData) => {
  const inventory = bankData.inventory || { 'A+': 10, 'A-': 5, 'B+': 10, 'B-': 5, 'AB+': 5, 'AB-': 2, 'O+': 15, 'O-': 8 };
  
  if (dbMode === 'mongodb') {
    return await MongoBloodBank.create({
      name: bankData.name,
      contactNumber: bankData.contactNumber,
      address: bankData.address,
      latitude: parseFloat(bankData.latitude),
      longitude: parseFloat(bankData.longitude),
      inventory
    });
  } else {
    const res = await sqliteRun(`
      INSERT INTO blood_banks (name, contact_number, address, latitude, longitude, inventory_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      bankData.name,
      bankData.contactNumber,
      bankData.address,
      parseFloat(bankData.latitude),
      parseFloat(bankData.longitude),
      JSON.stringify(inventory)
    ]);
    return { id: res.id, ...bankData, inventory };
  }
};

export const updateBloodBankInventory = async (bankId, inventory) => {
  if (dbMode === 'mongodb') {
    const updated = await MongoBloodBank.findByIdAndUpdate(
      bankId,
      { inventory },
      { new: true }
    );
    if (!updated) throw new Error("Blood bank not found.");
    return updated;
  } else {
    const check = await sqliteGet(`SELECT id FROM blood_banks WHERE id = ?`, [bankId]);
    if (!check) throw new Error("Blood bank not found.");
    await sqliteRun(`UPDATE blood_banks SET inventory_json = ? WHERE id = ?`, [JSON.stringify(inventory), bankId]);
    return { id: bankId, inventory };
  }
};
