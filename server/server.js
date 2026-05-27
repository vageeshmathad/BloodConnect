import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  initDb, 
  registerDonor, 
  loginDonor, 
  toggleDonorAvailability, 
  searchBloodSources, 
  registerBloodBank, 
  updateBloodBankInventory,
  dbMode,
  getHaversineDistance
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Initialize Database on server startup
initDb().then(() => {
  console.log(`Database initialized in '${dbMode}' mode.`);
}).catch(err => {
  console.error("Database initialization failed:", err);
});

// --- API Endpoints ---

// 1. Health & Status Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Emergency Blood Finder Platform API',
    databaseMode: dbMode,
    timestamp: new Date().toISOString()
  });
});

// 2. Search Blood Sources (Voluntary Donors & Institutional Blood Banks)
// Query params: bloodGroup, radius, latitude, longitude
app.get('/api/blood/search', async (req, res) => {
  const { bloodGroup, radius, latitude, longitude } = req.query;
  
  if (!bloodGroup) {
    return res.status(400).json({ success: false, error: "Blood group is required (e.g., O-, A+)." });
  }
  
  try {
    const radiusKm = parseFloat(radius || 10);
    const userLat = parseFloat(latitude || 12.9716); // Fallback: Bangalore Center
    const userLng = parseFloat(longitude || 77.5946);
    
    console.log(`Searching for '${bloodGroup}' within ${radiusKm}km of [${userLat}, ${userLng}]`);
    const results = await searchBloodSources(bloodGroup, radiusKm, userLat, userLng);
    
    res.json({
      success: true,
      bloodGroup,
      radiusKm,
      userLocation: { latitude: userLat, longitude: userLng },
      results
    });
  } catch (error) {
    console.error("Search query failure:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Register a Voluntary Donor
app.post('/api/donors/register', async (req, res) => {
  const { name, bloodGroup, phone, email, password, latitude, longitude, age, city, state, lastDonatedDate, medicalHistory, eligibilityFlags, consentChecked } = req.body;
  
  if (!name || !bloodGroup || !phone || !email || !password || !latitude || !longitude || !age || !city || !state) {
    return res.status(400).json({ success: false, error: "All fields (Name, Blood Group, Phone, Email, Password, Coordinates, Age, City, State) are required." });
  }
  
  try {
    const donor = await registerDonor({
      name,
      bloodGroup,
      phone,
      email,
      password,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      isAvailable: true,
      age: parseInt(age),
      city,
      state,
      lastDonatedDate,
      medicalHistory,
      eligibilityFlags,
      consentChecked
    });
    
    res.status(201).json({
      success: true,
      message: "Donor profile registered successfully! You can now log in to update availability.",
      donor: {
        name: donor.name,
        email: donor.email,
        bloodGroup: donor.bloodGroup,
        phone: donor.phone
      }
    });
  } catch (error) {
    console.error("Donor registration failure:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4. Voluntary Donor Login
app.post('/api/donors/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }
  
  try {
    const donor = await loginDonor(email, password);
    res.json({
      success: true,
      message: `Welcome back, ${donor.name}!`,
      donor
    });
  } catch (error) {
    console.error("Donor login failure:", error);
    res.status(401).json({ success: false, error: error.message });
  }
});

// 5. Toggle Voluntary Donor Availability Status
app.post('/api/donors/toggle-availability', async (req, res) => {
  const { email, isAvailable } = req.body;
  
  if (!email || isAvailable === undefined) {
    return res.status(400).json({ success: false, error: "Email and isAvailable status are required." });
  }
  
  try {
    await toggleDonorAvailability(email, isAvailable);
    res.json({
      success: true,
      message: `Availability status updated to: ${isAvailable ? 'AVAILABLE' : 'BUSY'}.`,
      isAvailable
    });
  } catch (error) {
    console.error("Toggle availability status failure:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 6. Register a Blood Bank (Admin Feature)
app.post('/api/bloodbanks/register', async (req, res) => {
  const { name, contactNumber, address, latitude, longitude, inventory } = req.body;
  
  if (!name || !contactNumber || !address || !latitude || !longitude) {
    return res.status(400).json({ success: false, error: "Name, contactNumber, address, latitude, and longitude are required." });
  }
  
  try {
    const bank = await registerBloodBank({
      name,
      contactNumber,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      inventory
    });
    
    res.status(201).json({
      success: true,
      message: "Blood bank institution registered successfully!",
      bloodBank: bank
    });
  } catch (error) {
    console.error("Blood bank registration failure:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 7. Update Blood Bank Inventory Levels (Admin Feature)
app.post('/api/bloodbanks/:id/inventory', async (req, res) => {
  const { inventory } = req.body;
  const bankId = req.params.id;
  
  if (!inventory) {
    return res.status(400).json({ success: false, error: "Inventory levels are required." });
  }
  
  try {
    const updated = await updateBloodBankInventory(bankId, inventory);
    res.json({
      success: true,
      message: "Blood bank inventory quantities updated in real-time!",
      inventory: updated.inventory
    });
  } catch (error) {
    console.error("Inventory update failure:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Emergency Blood Finder Server running on port ${PORT}`);
});
