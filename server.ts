import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8'));

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure CORS
  app.use(cors({
    origin: '*', // Allow all origins to prevent CORS issues in preview/shared environments
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization']
  }));

  app.use(express.json());

  // API Route to fetch appointments
  // Security: Simple API Key check
  app.get('/api/appointments', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    
    // In a real app, store this in .env
    const VALID_API_KEY = process.env.VITE_API_KEY || 'beltar_hospital_secret_key';

    if (apiKey !== VALID_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }

    try {
      const appointmentsCol = collection(db, 'appointments');
      const q = query(appointmentsCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/api/appointments`);
  });
}

startServer();
