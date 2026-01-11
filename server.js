import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import initSqlJs from 'sql.js'; // Main sql.js library
import { readFileSync, writeFileSync, existsSync } from 'fs'; // To load/save the wasm binary and database file

const app = express();
const JWT_SECRET = 'jobly_super_secret_key';
const DB_FILE = 'jobly.sqlite'; // Name of the database file

let db; // Declare db globally

// Helper for SELECT queries
async function executeQuery(sql, args = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  // Bind parameters
  stmt.bind(args);
  while (stmt.step()) {
    rows.push(stmt.getAsObject()); // getAsObject doesn't take args, it uses bound params
  }
  stmt.free();
  return { rows };
}

// Helper for INSERT/UPDATE/DELETE queries
async function executeRun(sql, args = []) {
  db.run(sql, args);
  return {};
}

// Function to save the database to a file
function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_FILE, buffer);
    console.log(`Database saved to ${DB_FILE}`);
    db.close(); // Close the database connection after saving
  }
}

// Initialize Tables
async function initDB() {
  // Load the sql-wasm.wasm file from the correct location within the sql.js package
  const SQL = await initSqlJs({
    wasmBinary: readFileSync('./node_modules/sql.js/dist/sql-wasm.wasm')
  });

  const dbExists = existsSync(DB_FILE);

  if (dbExists) {
    const filebuffer = readFileSync(DB_FILE);
    db = new SQL.Database(filebuffer);
    console.log(`Database loaded from ${DB_FILE}`);
  } else {
    db = new SQL.Database(); // Create an in-memory database
    console.log("New in-memory database created.");
  }

  // Schema creation (only if tables don't exist)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT CHECK(role IN ('candidate', 'employer', 'admin'))
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      company TEXT,
      location TEXT,
      salary TEXT,
      description TEXT,
      type TEXT,
      posted_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(posted_by) REFERENCES users(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER,
      user_id INTEGER,
      status TEXT DEFAULT 'applied',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(job_id) REFERENCES jobs(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  console.log("Database schema ensured.");

  // Add seed data if the database was just created (i.e., DB_FILE did not exist)
  if (!dbExists) {
    console.log("Seeding initial data...");
    const hashedPassword = await bcrypt.hash('password', 10);

    // Seed Users
    await executeRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Alice Smith', 'alice@example.com', hashedPassword, 'employer']
    );
    await executeRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Bob Johnson', 'bob@example.com', hashedPassword, 'candidate']
    );
    await executeRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Charlie Brown', 'charlie@example.com', hashedPassword, 'employer']
    );
    await executeRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['David Lee', 'david@example.com', hashedPassword, 'candidate']
    );


    // Get user IDs for job posting
    const alice = (await executeQuery('SELECT id FROM users WHERE email = ?', ['alice@example.com'])).rows[0].id;
    const charlie = (await executeQuery('SELECT id FROM users WHERE email = ?', ['charlie@example.com'])).rows[0].id;

    // Seed Jobs
    await executeRun(
      'INSERT INTO jobs (title, company, location, salary, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Frontend Developer', 'Tech Solutions Inc.', 'New York, NY', '$90,000 - $110,000', 'We are looking for a skilled Frontend Developer to join our dynamic team. Experience with React, Vue, or Angular is a plus.', 'Full-time', alice]
    );
    await executeRun(
      'INSERT INTO jobs (title, company, location, salary, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Senior Software Engineer', 'Global Innovations', 'San Francisco, CA', '$130,000 - $160,000', 'Seeking a Senior Software Engineer with strong backend experience in Node.js and Python. Must have experience with distributed systems.', 'Full-time', alice]
    );
    await executeRun(
      'INSERT INTO jobs (title, company, location, salary, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['UI/UX Designer', 'Creative Minds Studio', 'Remote', '$75,000 - $95,000', 'Passionate UI/UX Designer needed to craft intuitive and beautiful user interfaces. Portfolio required.', 'Remote', charlie]
    );
    await executeRun(
      'INSERT INTO jobs (title, company, location, salary, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Backend Developer', 'DataFlow Systems', 'Austin, TX', '$100,000 - $120,000', 'Join our team as a Backend Developer focusing on API development and database management. Node.js and SQL experience preferred.', 'Full-time', charlie]
    );
    await executeRun(
      'INSERT INTO jobs (title, company, location, salary, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Fullstack Software Developer', 'Innovate Corp', 'Seattle, WA', '$110,000 - $140,000', 'We need a versatile Fullstack Software Developer proficient in both frontend (React) and backend (Node.js) technologies.', 'Full-time', alice]
    );
    await executeRun(
      'INSERT INTO jobs (title, company, location, salary, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['DevOps Engineer', 'Cloud Solutions Ltd.', 'Remote', '$120,000 - $150,000', 'Experienced DevOps Engineer to manage CI/CD pipelines, cloud infrastructure (AWS/Azure), and automation tools.', 'Remote', charlie]
    );
    await executeRun(
      'INSERT INTO jobs (title, company, location, salary, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Data Scientist', 'Quant Analytics', 'Boston, MA', '$100,000 - $130,000', 'Seeking a Data Scientist with strong statistical modeling and machine learning skills. Python and R experience required.', 'Full-time', alice]
    );
    await executeRun(
      'INSERT INTO jobs (title, company, location, salary, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Mobile App Developer', 'AppGenius', 'Los Angeles, CA', '$95,000 - $125,000', 'Develop cutting-edge mobile applications for iOS and Android. Experience with React Native or Flutter is a plus.', 'Full-time', charlie]
    );
    console.log("Initial data seeded successfully.");
  }
}

app.use(cors());
app.use(express.json());

// Middleware (authenticateToken remains the same)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await executeRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    res.status(201).json({ message: 'User created' });
  } catch (e) {
    console.error("Registration error:", e);
    // sql.js throws an error on unique constraint violation
    res.status(400).json({ error: 'Email already exists or other DB error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await executeQuery(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  const user = result.rows[0];

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Job Routes
app.get('/api/jobs', async (req, res) => {
  const result = await executeQuery('SELECT * FROM jobs ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/jobs', authenticateToken, async (req, res) => {
  if (req.user.role !== 'employer' && req.user.role !== 'admin') return res.sendStatus(403);
  const { title, company, location, salary, description, type } = req.body;
  await executeRun(
    'INSERT INTO jobs (title, company, location, salary, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, company, location, salary, description, type, req.user.id]
  );
  res.status(201).json({ message: 'Job posted' });
});

// Application Routes
app.post('/api/apply/:jobId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ error: 'Only candidates can apply' });
  try {
    await executeRun(
      'INSERT INTO applications (job_id, user_id) VALUES (?, ?)',
      [req.params.jobId, req.user.id]
    );
    res.status(201).json({ message: 'Application submitted' });
  } catch (e) {
    console.error("Application error:", e);
    res.status(400).json({ error: 'Already applied or other DB error' });
  }
});

app.get('/api/my-applications', authenticateToken, async (req, res) => {
  const result = await executeQuery(
    `SELECT a.*, j.title, j.company 
     FROM applications a 
     JOIN jobs j ON a.job_id = j.id 
     WHERE a.user_id = ?`,
    [req.user.id]
  );
  res.json(result.rows);
});

export { app, initDB, saveDB }; // Export app, initDB, and saveDB