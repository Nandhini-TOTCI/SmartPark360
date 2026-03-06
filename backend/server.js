const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Note: In development, if MONGODB_URI is missing, we use a local fallback or skip
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpark';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define a simple Schema for Parking Spots
const SpotSchema = new mongoose.Schema({
  id: Number,
  name: String,
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  lastUpdated: { type: Date, default: Date.now }
});

const Spot = mongoose.model('Spot', SpotSchema);

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running', timestamp: new Date() });
});

// Get all parking spots
app.get('/api/spots', async (req, res) => {
  try {
    const spots = await Spot.find();
    // Seed data if empty
    if (spots.length === 0) {
      const seed = [
        { id: 1, name: "Spot A1", status: "available" },
        { id: 2, name: "Spot A2", status: "occupied" },
        { id: 3, name: "Spot B1", status: "available" }
      ];
      await Spot.insertMany(seed);
      return res.json(seed);
    }
    res.json(spots);
  } catch (error) {
    res.status(500).json({ message: "Error fetching spots", error: error.message });
  }
});

// Update spot status
app.patch('/api/spots/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const spot = await Spot.findOneAndUpdate(
      { id: req.params.id },
      { status, lastUpdated: new Date() },
      { new: true }
    );
    if (!spot) return res.status(404).json({ message: "Spot not found" });
    res.json(spot);
  } catch (error) {
    res.status(500).json({ message: "Error updating spot", error: error.message });
  }
});

// Export for Vercel
module.exports = app;

// Listen only if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
