require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('./db'); // ensures schema exists

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/eligibility', require('./routes/eligibility'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/content', require('./routes/content'));
app.use('/api/saved', require('./routes/saved'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));

// Uploaded PDFs and video files (served as-is; downloads have real filenames via note.pdf_original_name in the API response)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'govtex-orbit-backend' }));

// Serve the built frontend (frontend/dist, copied here as ./public during deployment)
// so a single service can host both the API and the web app. Falls back to the
// frontend's dev server (Vite) when ./public doesn't exist, e.g. local development.
const staticDir = path.join(__dirname, 'public');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`GovtEx Orbit backend running on http://localhost:${PORT}`));
