const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Multer configuration for file upload
const upload = multer({ 
  dest: 'upload/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Connect to Redis (existing connection code)
const client = redis.createClient({
  url: 'redis://@127.0.0.1:6379'
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// CSV Import Route
app.post('/residents/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];
  const errors = [];

  try {
    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    // Validate and save each resident
    for (const resident of results) {
      // Validate required fields (adjust as needed)
      const requiredFields = [
        'id', 'full_name', 'sex', 'dob', 'age', 'purok', 
        'contact_number', 'civil_status', 'occupation', 
        'educational_attainment', 'religion'
      ];

      const missingFields = requiredFields.filter(field => !resident[field]);
      
      if (missingFields.length > 0) {
        errors.push({
          resident,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
        continue;
      }

      try {
        // Save to Redis (similar to existing POST route logic)
        await client.hSet(`resident:${resident.id}`, 'full_name', resident.full_name);
        await client.hSet(`resident:${resident.id}`, 'sex', resident.sex);
        await client.hSet(`resident:${resident.id}`, 'dob', resident.dob);
        await client.hSet(`resident:${resident.id}`, 'age', resident.age);
        await client.hSet(`resident:${resident.id}`, 'purok', resident.purok);
        await client.hSet(`resident:${resident.id}`, 'contact_number', resident.contact_number);
        await client.hSet(`resident:${resident.id}`, 'civil_status', resident.civil_status);
        await client.hSet(`resident:${resident.id}`, 'occupation', resident.occupation);
        await client.hSet(`resident:${resident.id}`, 'educational_attainment', resident.educational_attainment);
        await client.hSet(`resident:${resident.id}`, 'religion', resident.religion);
      } catch (saveError) {
        errors.push({
          resident,
          error: `Failed to save: ${saveError.message}`
        });
      }
    }

    // Remove the temporary uploaded file
    fs.unlinkSync(req.file.path);

    // Respond with import results
    res.status(200).json({
      message: 'CSV import processed',
      totalImported: results.length - errors.length,
      totalErrors: errors.length,
      errors
    });

  } catch (error) {
    // Remove the temporary file in case of error
    if (req.file) fs.unlinkSync(req.file.path);
    
    res.status(500).json({ 
      message: 'Error processing CSV', 
      error: error.message 
    });
  }
});

// CRUD Operations
// Route to save resident data
app.post('/residents', async (req, res) => {
  const { id, full_name, sex, dob, age, purok, contact_number, civil_status, occupation, educational_attainment, religion } = req.body;


  // Validate input fields
  if (!id || !full_name || !sex || !dob || !age|| !purok || !contact_number || !civil_status || !occupation || !educational_attainment || !religion) {
    return res.status(400).json({ message: 'All fields are required' });
  }


  try {
    // Set resident data in Redis (using object syntax for Redis v4 and above)
    const residentData = { full_name, sex, dob, age, purok, contact_number, civil_status, occupation, educational_attainment, religion };


    // Save resident data in Redis hash
    await client.hSet(`resident:${id}`, 'full_name', residentData.full_name);
    await client.hSet(`resident:${id}`, 'sex', residentData.sex);
    await client.hSet(`resident:${id}`, 'dob', residentData.dob);
    await client.hSet(`resident:${id}`, 'age', residentData.age);
    await client.hSet(`resident:${id}`, 'purok', residentData.purok);
    await client.hSet(`resident:${id}`, 'contact_number', residentData.contact_number);
    await client.hSet(`resident:${id}`, 'civil_status', residentData.civil_status);
    await client.hSet(`resident:${id}`, 'occupation', residentData.occupation);
    await client.hSet(`resident:${id}`, 'educational_attainment', residentData.educational_attainment);
    await client.hSet(`resident:${id}`, 'religion', residentData.religion);


    // Respond with success message
    res.status(201).json({ message: 'Resident saved successfully' });
  } catch (error) {
    console.error('Error saving resident:', error);
    res.status(500).json({ message: 'Failed to save resident' });
  }
});


// Read (R)
app.get('/residents/:id', async (req, res) => {
  const id = req.params.id;
  const resident = await client.hGetAll(`resident:${id}`);
  if (Object.keys(resident).length === 0) {
    return res.status(404).json({ message: 'Resident not found' });
  }
  res.json(resident);
});


// Read all residents
app.get('/residents', async (req, res) => {
  const keys = await client.keys('resident:*');
  const residents = await Promise.all(keys.map(async (key) => {
    return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
  }));
  res.json(residents);
});


// Update (U)
app.put('/residents/:id', async (req, res) => {
  const id = req.params.id;
  const { full_name, sex, dob, age, purok, contact_number, civil_status, occupation, educational_attainment, religion } = req.body;


  if (!full_name && !sex && !dob && !age && !purok && !contact_number && !civil_status && !occupation && !educational_attainment && !religion) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }


  try {
    const existingResident = await client.hGetAll(`resident:${id}`);
    if (Object.keys(existingResident).length === 0) {
      return res.status(404).json({ message: 'Resident not found' });
    }


    // Update resident data in Redis
    if (full_name) await client.hSet(`resident:${id}`, 'full_name', full_name);
    if (sex) await client.hSet(`resident:${id}`, 'sex', sex);
    if (dob) await client.hSet(`resident:${id}`, 'dob', dob);
    if (age) await client.hSet(`resident:${id}`, 'age', age);
    if (purok) await client.hSet(`resident:${id}`, 'purok', purok);
    if (contact_number) await client.hSet(`resident:${id}`, 'contact_number', contact_number);
    if (civil_status) await client.hSet(`resident:${id}`, 'civil_status', civil_status);
    if (occupation) await client.hSet(`resident:${id}`, 'occupation', occupation);
    if (educational_attainment) await client.hSet(`resident:${id}`, 'educational_attainment', educational_attainment);
    if (religion) await client.hSet(`resident:${id}`, 'religion', religion);


    res.status(200).json({ message: 'Resident updated successfully' });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ message: 'Failed to update resident' });
  }
});


// Delete (D)
app.delete('/residents/:id', async (req, res) => {
  const id = req.params.id;
  await client.del(`resident:${id}`);
  res.status(200).json({ message: 'Resident deleted successfully' });
});


// Officials CRUD Operations


// Create (C)
app.post('/officials', async (req, res) => {
  const { id, full_name, position, rank, committee, term_start, term_end, contact_number, email, address, photo_url } = req.body;


  // Validate input fields
  if (!id || !full_name || !position) {
    return res.status(400).json({ message: 'Required fields missing' });
  }


  try {
    // Save official data in Redis hash
    await client.hSet(`official:${id}`, 'full_name', full_name);
    await client.hSet(`official:${id}`, 'position', position);
    await client.hSet(`official:${id}`, 'rank', rank.toString());
    await client.hSet(`official:${id}`, 'committee', committee);
    await client.hSet(`official:${id}`, 'term_start', term_start);
    await client.hSet(`official:${id}`, 'term_end', term_end);
    await client.hSet(`official:${id}`, 'contact_number', contact_number);
    await client.hSet(`official:${id}`, 'email', email);
    await client.hSet(`official:${id}`, 'address', address);
    await client.hSet(`official:${id}`, 'photo_url', photo_url || '');


    // Respond with success message
    res.status(201).json({ message: 'Official added successfully' });
  } catch (error) {
    console.error('Error saving official:', error);
    res.status(500).json({ message: 'Failed to save official' });
  }
});


// Read (R)
app.get('/officials/:id', async (req, res) => {
  const id = req.params.id;
  const official = await client.hGetAll(`official:${id}`);
  if (Object.keys(official).length === 0) {
    return res.status(404).json({ message: 'Official not found' });
  }
  res.json(official);
});


// Read all officials
app.get('/officials', async (req, res) => {
  const keys = await client.keys('official:*');
  const officials = await Promise.all(keys.map(async (key) => {
    const data = await client.hGetAll(key);
    // Convert rank back to number for proper sorting
    if (data.rank) {
      data.rank = parseInt(data.rank);
    }
    return { id: key.split(':')[1], ...data };
  }));
  res.json(officials);
});


// Update (U)
app.put('/officials/:id', async (req, res) => {
  const id = req.params.id;
  const { full_name, position, rank, committee, term_start, term_end, contact_number, email, address, photo_url } = req.body;


  try {
    const existingOfficial = await client.hGetAll(`official:${id}`);
    if (Object.keys(existingOfficial).length === 0) {
      return res.status(404).json({ message: 'Official not found' });
    }


    // Update official data in Redis
    if (full_name) await client.hSet(`official:${id}`, 'full_name', full_name);
    if (position) await client.hSet(`official:${id}`, 'position', position);
    if (rank) await client.hSet(`official:${id}`, 'rank', rank.toString());
    if (committee) await client.hSet(`official:${id}`, 'committee', committee);
    if (term_start) await client.hSet(`official:${id}`, 'term_start', term_start);
    if (term_end) await client.hSet(`official:${id}`, 'term_end', term_end);
    if (contact_number) await client.hSet(`official:${id}`, 'contact_number', contact_number);
    if (email) await client.hSet(`official:${id}`, 'email', email);
    if (address) await client.hSet(`official:${id}`, 'address', address);
    if (photo_url !== undefined) await client.hSet(`official:${id}`, 'photo_url', photo_url);


    res.status(200).json({ message: 'Official updated successfully' });
  } catch (error) {
    console.error('Error updating official:', error);
    res.status(500).json({ message: 'Failed to update official' });
  }
});


// Delete (D)
app.delete('/officials/:id', async (req, res) => {
  const id = req.params.id;
  await client.del(`official:${id}`);
  res.status(200).json({ message: 'Official deleted successfully' });
});



// Project CRUD Operations

// Helper function to generate project ID
async function generateProjectId() {
  try {
    // Get the current project count
    const projectCount = await client.get('project_counter') || 0;
    
    // Increment the counter
    const newCounter = parseInt(projectCount) + 1;
    await client.set('project_counter', newCounter);
    
    // Format the ID as PJ followed by a padded number (PJ001, PJ002, etc.)
    return `PJ${String(newCounter).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating project ID:', error);
    throw error;
  }
}

// Create (C)
app.post('/projects', async (req, res) => {
  const { 
    title, 
    description, 
    budget, 
    start_date, 
    end_date, 
    status, 
    location, 
    beneficiaries, 
    coordinator, 
    partners 
  } = req.body;

  // Validate required fields
  if (!title || !description || !budget || !start_date || !status) {
    return res.status(400).json({ message: 'Required fields missing (title, description, budget, start_date, status)' });
  }

  try {
    // Generate unique project ID
    const id = await generateProjectId();
    
    // Set project data in Redis hash
    await client.hSet(`project:${id}`, 'title', title);
    await client.hSet(`project:${id}`, 'description', description);
    await client.hSet(`project:${id}`, 'budget', budget.toString());
    await client.hSet(`project:${id}`, 'start_date', start_date);
    await client.hSet(`project:${id}`, 'end_date', end_date || '');
    await client.hSet(`project:${id}`, 'status', status);
    await client.hSet(`project:${id}`, 'location', location || '');
    await client.hSet(`project:${id}`, 'beneficiaries', beneficiaries || '');
    await client.hSet(`project:${id}`, 'coordinator', coordinator || '');
    await client.hSet(`project:${id}`, 'partners', partners || '');
    await client.hSet(`project:${id}`, 'created_at', new Date().toISOString());
    
    // Add to project list for easy retrieval
    await client.sAdd('projects', id);

    // Respond with success message and the generated ID
    res.status(201).json({ 
      message: 'Project created successfully', 
      project_id: id 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Read (R) - Get a specific project
app.get('/projects/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const project = await client.hGetAll(`project:${id}`);
    
    if (Object.keys(project).length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Parse numeric fields
    if (project.budget) {
      project.budget = parseFloat(project.budget);
    }
    
    res.json({ id, ...project });
  } catch (error) {
    console.error('Error retrieving project:', error);
    res.status(500).json({ message: 'Failed to retrieve project' });
  }
});

// Read all projects
app.get('/projects', async (req, res) => {
  try {
    // Get all project keys
    const keys = await client.keys('project:*');
    
    const projects = await Promise.all(keys.map(async (key) => {
      const data = await client.hGetAll(key);
      const id = key.split(':')[1];
      
      // Parse numeric fields
      if (data.budget) {
        data.budget = parseFloat(data.budget);
      }
      
      return { id, ...data };
    }));
    
    // Sort projects by creation date (newest first)
    projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(projects);
  } catch (error) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({ message: 'Failed to retrieve projects' });
  }
});

// Update (U)
app.put('/projects/:id', async (req, res) => {
  const id = req.params.id;
  const { 
    title, 
    description, 
    budget, 
    start_date, 
    end_date, 
    status, 
    location, 
    beneficiaries, 
    coordinator, 
    partners 
  } = req.body;

  try {
    // Check if project exists
    const existingProject = await client.exists(`project:${id}`);
    
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update project data in Redis
    if (title) await client.hSet(`project:${id}`, 'title', title);
    if (description) await client.hSet(`project:${id}`, 'description', description);
    if (budget) await client.hSet(`project:${id}`, 'budget', budget.toString());
    if (start_date) await client.hSet(`project:${id}`, 'start_date', start_date);
    if (end_date !== undefined) await client.hSet(`project:${id}`, 'end_date', end_date);
    if (status) await client.hSet(`project:${id}`, 'status', status);
    if (location !== undefined) await client.hSet(`project:${id}`, 'location', location);
    if (beneficiaries !== undefined) await client.hSet(`project:${id}`, 'beneficiaries', beneficiaries);
    if (coordinator !== undefined) await client.hSet(`project:${id}`, 'coordinator', coordinator);
    if (partners !== undefined) await client.hSet(`project:${id}`, 'partners', partners);
    await client.hSet(`project:${id}`, 'updated_at', new Date().toISOString());

    res.status(200).json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete (D)
app.delete('/projects/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    // Check if project exists
    const existingProject = await client.exists(`project:${id}`);
    
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Delete the project from Redis
    await client.del(`project:${id}`);
    
    // Remove from the projects set
    await client.sRem('projects', id);
    
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

