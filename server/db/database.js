const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'saksham.db');

let db;

async function getDb() {
  if (!db) {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  }
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper: run a statement with params
function run(database, sql, params = []) {
  database.run(sql, params);
  saveDb();
}

// Helper: get one row
function get(database, sql, params = []) {
  const stmt = database.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

// Helper: get all rows
function all(database, sql, params = []) {
  const results = [];
  const stmt = database.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

async function initializeDatabase() {
  const database = await getDb();

  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS accessibility_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      font_size TEXT DEFAULT 'medium',
      high_contrast INTEGER DEFAULT 0,
      dark_mode INTEGER DEFAULT 0,
      text_to_speech INTEGER DEFAULT 0,
      speech_speed REAL DEFAULT 1.0,
      screen_reader_mode INTEGER DEFAULT 0,
      sign_language_support INTEGER DEFAULT 0,
      reduced_motion INTEGER DEFAULT 0,
      line_spacing TEXT DEFAULT 'normal',
      letter_spacing TEXT DEFAULT 'normal',
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS past_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam TEXT NOT NULL,
      year INTEGER NOT NULL,
      subject TEXT,
      paper_type TEXT,
      title TEXT NOT NULL,
      url TEXT,
      source TEXT,
      is_demo INTEGER DEFAULT 0,
      questions TEXT
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT DEFAULT 'New Conversation',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    )
  `);

  // Seed demo papers if empty
  const result = all(database, 'SELECT COUNT(*) as cnt FROM past_papers');
  const cnt = result[0]?.cnt || 0;
  if (cnt == 0) {
    seedDemoPapers(database);
  }

  saveDb();
  console.log('✅ Database initialized');
}

function seedDemoPapers(database) {
  const neetQuestions = JSON.stringify([
    { id: 1, question: "Which of the following is NOT a characteristic of living organisms?", options: ["Growth", "Reproduction", "Metabolism", "Crystallization"], correct: 3, explanation: "Crystallization is a physical process that occurs in non-living matter. All living organisms exhibit growth, reproduction, and metabolism." },
    { id: 2, question: "The basic unit of life is:", options: ["Tissue", "Organ", "Cell", "Organism"], correct: 2, explanation: "The cell is the basic structural and functional unit of life, as established by cell theory." },
    { id: 3, question: "Photosynthesis takes place in:", options: ["Mitochondria", "Chloroplasts", "Nucleus", "Ribosomes"], correct: 1, explanation: "Chloroplasts contain chlorophyll which captures sunlight to convert CO₂ and water into glucose." },
    { id: 4, question: "DNA replication occurs in which phase?", options: ["G1 phase", "S phase", "G2 phase", "M phase"], correct: 1, explanation: "DNA synthesis (replication) occurs during the S (Synthesis) phase of interphase." },
    { id: 5, question: "The powerhouse of the cell is:", options: ["Nucleus", "Golgi apparatus", "Mitochondria", "Endoplasmic reticulum"], correct: 2, explanation: "Mitochondria produce ATP through cellular respiration." },
  ]);

  const jeeQuestions = JSON.stringify([
    { id: 1, question: "The value of lim(x→0) [sin(x)/x] is:", options: ["0", "1", "∞", "Undefined"], correct: 1, explanation: "This is a fundamental limit. As x approaches 0, sin(x)/x approaches 1." },
    { id: 2, question: "Boyle's Law states pressure is:", options: ["Directly proportional to volume", "Inversely proportional to volume", "Independent of volume", "Equal to volume"], correct: 1, explanation: "Boyle's Law: P ∝ 1/V at constant temperature." },
    { id: 3, question: "The unit of electric field is:", options: ["Newton", "Coulomb", "N/C or V/m", "Joule"], correct: 2, explanation: "Electric field is force per unit charge (N/C), equivalent to V/m." },
    { id: 4, question: "∫e^x dx equals:", options: ["e^x + C", "xe^x + C", "e^(x+1) + C", "1/e^x + C"], correct: 0, explanation: "The integral of e^x is e^x itself plus C." },
    { id: 5, question: "Newton's second law states F =", options: ["mv", "ma", "m/a", "v/t"], correct: 1, explanation: "F = ma (Force = mass × acceleration)." },
  ]);

  const upscQuestions = JSON.stringify([
    { id: 1, question: "Which article deals with Right to Equality?", options: ["Article 12", "Article 14", "Article 19", "Article 21"], correct: 1, explanation: "Article 14 guarantees equality before law to all persons in India." },
    { id: 2, question: "The Preamble of Indian Constitution begins with:", options: ["We the Citizens", "We the People", "We the Nation", "We the Republic"], correct: 1, explanation: "The Preamble begins with 'WE, THE PEOPLE OF INDIA'." },
    { id: 3, question: "Which river is 'Sorrow of Bihar'?", options: ["Ganga", "Kosi", "Gandak", "Son"], correct: 1, explanation: "The Kosi river is called 'Sorrow of Bihar' due to frequent devastating floods." },
    { id: 4, question: "Planning Commission was replaced by:", options: ["Finance Commission", "NITI Aayog", "Economic Advisory Council", "Cabinet Committee"], correct: 1, explanation: "NITI Aayog replaced the Planning Commission in 2015." },
    { id: 5, question: "Which is a Fundamental Duty under Article 51A?", options: ["Right to vote", "To respect the Constitution and national symbols", "Right to education", "Right to work"], correct: 1, explanation: "Article 51A(a) — duty to abide by the Constitution and respect national symbols." },
  ]);

  const papers = [
    ['NEET', 2023, 'Biology', 'Full Paper', 'NEET 2023 - Biology (Demo)', 'https://nta.ac.in', 'NTA Official', 1, neetQuestions],
    ['NEET', 2022, 'Physics', 'Full Paper', 'NEET 2022 - Physics (Demo)', 'https://nta.ac.in', 'NTA Official', 1, neetQuestions],
    ['NEET', 2021, 'Chemistry', 'Full Paper', 'NEET 2021 - Chemistry (Demo)', 'https://nta.ac.in', 'NTA Official', 1, neetQuestions],
    ['JEE', 2023, 'Mathematics', 'JEE Main', 'JEE Main 2023 - Mathematics (Demo)', 'https://jeemain.nta.nic.in', 'NTA Official', 1, jeeQuestions],
    ['JEE', 2023, 'Physics', 'JEE Advanced', 'JEE Advanced 2023 - Physics (Demo)', 'https://jeeadv.ac.in', 'IIT Official', 1, jeeQuestions],
    ['JEE', 2022, 'Chemistry', 'JEE Main', 'JEE Main 2022 - Chemistry (Demo)', 'https://jeemain.nta.nic.in', 'NTA Official', 1, jeeQuestions],
    ['UPSC', 2023, 'General Studies', 'Prelims', 'UPSC CSE 2023 - General Studies Paper I (Demo)', 'https://upsc.gov.in', 'UPSC Official', 1, upscQuestions],
    ['UPSC', 2023, 'CSAT', 'Prelims', 'UPSC CSE 2023 - CSAT Paper II (Demo)', 'https://upsc.gov.in', 'UPSC Official', 1, upscQuestions],
    ['UPSC', 2022, 'General Studies', 'Mains', 'UPSC CSE 2022 - GS Mains Paper I (Demo)', 'https://upsc.gov.in', 'UPSC Official', 1, upscQuestions],
  ];

  for (const p of papers) {
    database.run(
      'INSERT INTO past_papers (exam, year, subject, paper_type, title, url, source, is_demo, questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      p
    );
  }
  console.log('✅ Demo past papers seeded');
}

module.exports = { getDb, initializeDatabase, run, get, all, saveDb };
