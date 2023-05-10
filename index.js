const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Set up Express
const app = express();
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const fileName = uuidv4() + '-' + file.originalname;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect('mongodb://localhost/yourhr', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the Resume schema
const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  file: String,
});

const Resume = mongoose.model('Resume', resumeSchema);

// Define routes
app.post('/api/resumes', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const file = req.file.filename;

    const resume = new Resume({ name, email, phone, file });
    await resume.save();

    res.status(201).json({ message: 'Resume submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
