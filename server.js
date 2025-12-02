const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Route
app.get('/', (req, res) => {
  res.send('UnlockMate API is running...');
});

// ------------------------------------------
// DATABASE CONNECTION (MongoDB)
// ------------------------------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlockmate';

// Only connect if URI is present (prevents crash in some environments)
if (process.env.MONGODB_URI || MONGODB_URI.includes('localhost')) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));
}

// ------------------------------------------
// MODELS
// ------------------------------------------
const RequestSchema = new mongoose.Schema({
  url: String,
  email: String,
  status: { type: String, default: 'REQUESTED' },
  metadata: {
    title: String,
    platform: String,
    subject: String,
    summary: String
  },
  unlockedUrl: String,
  unlockType: String,
  createdAt: { type: Date, default: Date.now }
});

RequestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Request = mongoose.model('Request', RequestSchema);

// ------------------------------------------
// EMAIL CONFIGURATION
// ------------------------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ------------------------------------------
// FILE UPLOAD CONFIGURATION
// ------------------------------------------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '-'));
  }
});

const upload = multer({ storage: storage });

// ------------------------------------------
// ROUTES
// ------------------------------------------

app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/requests/:id/fulfill', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { externalLink } = req.body;
    
    let unlockedUrl = externalLink;
    if (req.file) {
      unlockedUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      id, 
      { 
        status: 'PAYMENT_REQUIRED',
        unlockedUrl: unlockedUrl
      },
      { new: true }
    );

    if (!updatedRequest) return res.status(404).json({ error: "Request not found" });

    // Send Email
    if (updatedRequest.email && process.env.EMAIL_USER) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: updatedRequest.email,
        subject: `Document Ready: ${updatedRequest.metadata?.title || 'UnlockMate Request'}`,
        html: `
          <h2>Your document is ready!</h2>
          <p>The document you requested has been successfully unlocked.</p>
          <p>Please return to the website to complete your payment and download the file.</p>
        `
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if(err) console.error("Email error:", err);
      });
    }

    res.json(updatedRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/requests/:id/pay', async (req, res) => {
  try {
    const { unlockType } = req.body;
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'READY',
        unlockType: unlockType
      },
      { new: true }
    );
    res.json(updatedRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/requests/:id/cancel', async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'FAILED' },
      { new: true }
    );
    res.json(updatedRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});