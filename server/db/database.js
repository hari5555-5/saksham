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
      institution TEXT DEFAULT 'Biotechnology Institute',
      education_level TEXT DEFAULT 'Undergraduate',
      interests TEXT DEFAULT 'Genetics, Biosensors, AI',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migration helper for users table columns
  try {
    database.run(`ALTER TABLE users ADD COLUMN institution TEXT DEFAULT 'Biotechnology Institute'`);
  } catch (e) {}
  try {
    database.run(`ALTER TABLE users ADD COLUMN education_level TEXT DEFAULT 'Undergraduate'`);
  } catch (e) {}
  try {
    database.run(`ALTER TABLE users ADD COLUMN interests TEXT DEFAULT 'Genetics, Biosensors, AI'`);
  } catch (e) {}

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

  // BioBridge AI Tables
  database.run(`
    CREATE TABLE IF NOT EXISTS research_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      abstract TEXT NOT NULL,
      authors TEXT NOT NULL,
      publication_year INTEGER NOT NULL,
      category TEXT NOT NULL,
      topic TEXT NOT NULL,
      methodology TEXT NOT NULL,
      biomarkers TEXT,
      source TEXT,
      url TEXT,
      population_studied TEXT,
      is_transgender_pathway INTEGER DEFAULT 0,
      is_autism_pathway INTEGER DEFAULT 0,
      simplified_summary TEXT,
      biological_meaning TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS user_research_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      paper_id INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      saved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (paper_id) REFERENCES research_papers(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS competitive_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam TEXT NOT NULL,
      topic TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      concept TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Medium'
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS user_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      answer INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES competitive_questions(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS project_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      interest TEXT NOT NULL,
      biological_problem TEXT NOT NULL,
      research_question TEXT NOT NULL,
      biomarker TEXT NOT NULL,
      methodology TEXT NOT NULL,
      biosensor_possibility TEXT NOT NULL,
      generated_content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS saved_biomarkers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      biomarker_name TEXT NOT NULL,
      category TEXT NOT NULL,
      function_summary TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS biotech_experiments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      aim TEXT NOT NULL,
      materials TEXT NOT NULL,
      procedure_steps TEXT NOT NULL,
      biosensor_biomarker_data TEXT NOT NULL,
      simplified_beginner TEXT NOT NULL,
      simplified_intermediate TEXT NOT NULL,
      simplified_advanced TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Seed demo papers if empty
  const result = all(database, 'SELECT COUNT(*) as cnt FROM past_papers');
  const cnt = result[0]?.cnt || 0;
  if (cnt == 0) {
    seedDemoPapers(database);
  }

  // Seed BioBridge research papers if empty
  const resBio = all(database, 'SELECT COUNT(*) as cnt FROM research_papers');
  if ((resBio[0]?.cnt || 0) === 0) {
    seedBioBridgePapers(database);
  }

  // Seed BioBridge competitive questions if empty
  const resComp = all(database, 'SELECT COUNT(*) as cnt FROM competitive_questions');
  if ((resComp[0]?.cnt || 0) === 0) {
    seedBioBridgeCompetitiveQuestions(database);
  }

  // Seed biotech experiments if empty
  const resExp = all(database, 'SELECT COUNT(*) as cnt FROM biotech_experiments');
  if ((resExp[0]?.cnt || 0) === 0) {
    seedBiotechExperiments(database);
  }

  saveDb();
  console.log('✅ Database & APD EQUILEARN schema initialized');
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

function seedBioBridgePapers(database) {
  const bioPapers = [
    {
      title: "Plasma Metabolomic Changes During Feminizing Gender-Affirming Hormone Therapy",
      abstract: "Comprehensive longitudinal study analyzing serum metabolites, lipid pathways, and endocrinological biomarkers during estradiol and anti-androgen therapy. Demonstrates shift in lipidome and amino acid dynamics in transgender individuals.",
      authors: "Dr. Alex Ramsey, PhD (Transgender Health & Endocrinology Researcher), Dr. Jamie Thorne, MD (Gender-Affirming Medicine Specialist & Transgender Scholar)",
      publication_year: 2024,
      category: "Gender-Affirming Healthcare Research",
      topic: "Metabolomics & Hormonal Biomarkers",
      methodology: "Liquid Chromatography-Mass Spectrometry (LC-MS), longitudinal blood serum sampling at 0, 3, 6, and 12 months.",
      biomarkers: "Estradiol, Testosterone, Sphingomyelins, Phosphatidylcholines, Triglycerides, SHBG",
      source: "Journal of Transgender Health & Endocrinology",
      url: "https://doi.org/10.1089/trgh.2024.0042",
      population_studied: "Transgender women undergoing feminizing hormone therapy (n=120)",
      is_transgender_pathway: 1,
      is_autism_pathway: 0,
      simplified_summary: "Researchers observed that feminizing hormone therapy induces significant, reversible shifts in plasma lipid profiles and amino acid concentrations toward typical female physiological reference ranges.",
      biological_meaning: "Provides molecular insight into how exogenous estrogen reshapes hepatic lipid metabolism and systemic metabolic equilibrium without pathological impairment."
    },
    {
      title: "Genomic Profiling and Gut Microbiome Biomarkers in Neurodevelopmental Diversity",
      abstract: "High-throughput genomic sequencing and metagenomic analysis identifying specific microbial metabolite ratios (short-chain fatty acids, propionate) correlated with neurodevelopmental variation in children.",
      authors: "Dr. Elena Vance, Dr. Marcus Lin, Dr. Sarah Al-Mansoori",
      publication_year: 2023,
      category: "Neurodevelopment",
      topic: "Genomics & Microbiome",
      methodology: "16S rRNA gene sequencing, Shotgun metagenomics, Gas chromatography-mass spectrometry (GC-MS).",
      biomarkers: "Propionate, Butyrate, Acetate, MicroRNA-132, BDNF",
      source: "Nature Neuroscience Exploration",
      url: "https://doi.org/10.1038/s41593-023-01412-x",
      population_studied: "Neurodivergent pediatric cohort (n=250) and neurotypical controls",
      is_transgender_pathway: 0,
      is_autism_pathway: 1,
      simplified_summary: "This study uncovered unique gut microbiome metabolite ratios (specifically elevated short-chain fatty acids) associated with gut-brain axis signalling in neurodivergent individuals.",
      biological_meaning: "Demonstrates that metabolic signals produced by gut microbiota directly modulate neurodevelopmental pathways and synaptic pruning mechanisms."
    },
    {
      title: "Electrochemical Biosensor for Real-Time Electrochemical MicroRNA Detection in Circulating Tumor Exosomes",
      abstract: "Design and fabrication of a gold nanoparticle-functionalized electrochemical biosensor capable of ultr संवेदनशील detection of Oncogenic MiR-21 in breast cancer serum samples.",
      authors: "Dr. Chen Wei, Dr. Priya Sharma, Dr. Robert Sterling",
      publication_year: 2024,
      category: "Biosensors",
      topic: "Cancer Biomarkers & Nanotechnology",
      methodology: "Gold nanoparticle self-assembly, Square wave voltammetry (SWV), Aptamer probe immobilization.",
      biomarkers: "MicroRNA-21 (MiR-21), Exosomal Surface Protein CD63",
      source: "Biosensors & Bioelectronics",
      url: "https://doi.org/10.1016/j.bios.2024.115982",
      population_studied: "Clinical breast cancer patient serum isolates (n=85)",
      is_transgender_pathway: 0,
      is_autism_pathway: 0,
      simplified_summary: "A portable sensor utilizing custom RNA probes on gold surfaces detected early-stage cancer markers in blood droplets with sub-femtomolar sensitivity.",
      biological_meaning: "Enables non-invasive point-of-care liquid biopsy monitoring before clinical tumor manifestations occur."
    },
    {
      title: "CRISPR-Cas13 Mediated RNA Editing for Targeted Genetic Expression Regulation in Cardiovascular Endothelium",
      abstract: "Investigation of catalytically inactive Cas13 fused with ADAR deaminase for precise single-base RNA correction in endothelial dysfunction models.",
      authors: "Dr. Hannah Schmidt, Dr. Kenji Sato",
      publication_year: 2023,
      category: "Genetics",
      topic: "Molecular Biology & Gene Editing",
      methodology: "Lentiviral RNA delivery, Next-Generation RNA sequencing, Western blot quantification.",
      biomarkers: "eNOS, VCAM-1, Caspase-3",
      source: "Cell Molecular Genetics",
      url: "https://doi.org/10.1016/j.cell.2023.09.011",
      population_studied: "Human umbilical vein endothelial cell (HUVEC) in vitro model",
      is_transgender_pathway: 0,
      is_autism_pathway: 0,
      simplified_summary: "Cas13 RNA editing targeted aberrant messenger RNA transcripts without altering genomic DNA, successfully restoring cellular nitric oxide synthesis.",
      biological_meaning: "Offers a temporary, controllable gene therapy approach that avoids permanent off-target genomic DNA alterations."
    }
  ];

  for (const p of bioPapers) {
    database.run(
      `INSERT INTO research_papers (title, abstract, authors, publication_year, category, topic, methodology, biomarkers, source, url, population_studied, is_transgender_pathway, is_autism_pathway, simplified_summary, biological_meaning)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.title, p.abstract, p.authors, p.publication_year, p.category, p.topic, p.methodology, p.biomarkers, p.source, p.url, p.population_studied, p.is_transgender_pathway, p.is_autism_pathway, p.simplified_summary, p.biological_meaning]
    );
  }
  console.log('✅ Seeded BioBridge AI research papers');
}

function seedBioBridgeCompetitiveQuestions(database) {
  const compQuestions = [
    {
      exam: "GATE Biotechnology",
      topic: "Molecular Biology",
      question: "Which enzyme is responsible for synthesizing the RNA primer during DNA replication in Escherichia coli?",
      options: JSON.stringify(["DNA Polymerase I", "DnaG Primase", "RNA Polymerase II", "Reverse Transcriptase"]),
      correct_answer: 1,
      explanation: "In E. coli, DnaG primase is a specialized RNA polymerase that synthesizes short RNA primers (~10-12 nucleotides) required for DNA polymerase III initiation on both leading and lagging strands.",
      concept: "DNA Replication Machinery & Primase Function",
      difficulty: "Medium"
    },
    {
      exam: "JEE",
      topic: "Biochemistry",
      question: "Which of the following amino acids contains an indole ring in its side chain structure?",
      options: JSON.stringify(["Histidine", "Tryptophan", "Phenylalanine", "Tyrosine"]),
      correct_answer: 1,
      explanation: "Tryptophan contains a bicyclic indole ring system attached to its beta-carbon, contributing to its intrinsic ultraviolet fluorescence properties.",
      concept: "Amino Acid Side Chain Structure & Chemistry",
      difficulty: "Medium"
    },
    {
      exam: "NEET",
      topic: "Genetics",
      question: "Which pattern of inheritance is characterized by affected fathers transmitting the trait to ALL of their daughters but NONE of their sons?",
      options: JSON.stringify(["Autosomal Recessive", "X-Linked Dominant", "X-Linked Recessive", "Y-Linked Holandric"]),
      correct_answer: 1,
      explanation: "Fathers pass their X chromosome to all daughters and Y chromosome to all sons. In X-linked dominant inheritance, an affected father will pass the dominant mutant X allele to 100% of his daughters and 0% of his sons.",
      concept: "Pedigree Analysis & Sex-Linked Dominant Traits",
      difficulty: "Hard"
    },
    {
      exam: "UPSC",
      topic: "Biosensors",
      question: "In public health biotechnology & administrative policy, which regulatory framework oversees recombinant DNA safety & biosafety guidelines in India?",
      options: JSON.stringify(["ICMR Ethics Board", "RCGM & GEAC under Environment Protection Act 1986", "NITI Aayog Health Panel", "FSSAI Taskforce"]),
      correct_answer: 1,
      explanation: "In India, genetic engineering and GMOs are regulated under the 1986 Environment (Protection) Act through RCGM (Review Committee on Genetic Manipulation) and GEAC (Genetic Engineering Appraisal Committee).",
      concept: "Biotechnology Policy, GEAC & National Biosafety Governance",
      difficulty: "Medium"
    },
    {
      exam: "CSIR UGC NET",
      topic: "Molecular Biology",
      question: "During eukaryotic transcription initiation by RNA Polymerase II, which basal transcription factor possesses intrinsic kinase activity that phosphorylates the CTD (carboxy-terminal domain) of the large subunit?",
      options: JSON.stringify(["TFIID", "TFIIB", "TFIIH", "TFIIF"]),
      correct_answer: 2,
      explanation: "TFIIH has dual enzymatic functions: 3'-5' and 5'-3' ATP-dependent helicases for promoter melting, and a CDK7 kinase subunit that phosphorylates Serine-5 on the RNA Pol II CTD repeats to trigger promoter clearance.",
      concept: "Eukaryotic Transcription Machinery & Pol II CTD Phosphorylation",
      difficulty: "Hard"
    },
    {
      exam: "GAT-B",
      topic: "Microbiology",
      question: "Which bacterial cell wall component is specifically targeted by lysozyme cleavage of beta-1,4-glycosidic bonds?",
      options: JSON.stringify(["Teichoic acid", "Peptidoglycan (NAG-NAM)", "Lipopolysaccharide (LPS)", "Outer membrane porin"]),
      correct_answer: 1,
      explanation: "Lysozyme hydrolyzes the beta-1,4-glycosidic bond between N-acetylglucosamine (NAG) and N-acetylmuramic acid (NAM) in bacterial peptidoglycan walls.",
      concept: "Bacterial Cell Wall Architecture & Enzymatic Cleavage",
      difficulty: "Easy"
    },
    {
      exam: "CUET UG",
      topic: "Cell Biology",
      question: "Which organelle is responsible for post-translational modification, sorting, and packaging of proteins into secretory vesicles?",
      options: JSON.stringify(["Smooth Endoplasmic Reticulum", "Golgi Apparatus", "Peroxisome", "Lysosome"]),
      correct_answer: 1,
      explanation: "The Golgi apparatus modifies proteins (glycosylation, sulfation) arriving from the ER and sorts them into targeted secretory, lysosomal, or plasma membrane vesicles.",
      concept: "Eukaryotic Organelle Trafficking & Golgi Processing",
      difficulty: "Easy"
    },
    {
      exam: "IIT JAM",
      topic: "Biochemistry",
      question: "In thermodynamics of protein folding, what is the major non-covalent driving force behind globular protein stability in aqueous solution?",
      options: JSON.stringify(["Hydrogen bonding", "Hydrophobic effect & entropy gain of water", "Ionic salt bridges", "Van der Waals dispersion"]),
      correct_answer: 1,
      explanation: "Burying nonpolar hydrophobic amino acid residues inside the protein core releases clathrate-bound water molecules, providing a large positive gain in solvent entropy (delta-S > 0).",
      concept: "Thermodynamics of Protein Folding & Hydrophobic Interaction",
      difficulty: "Medium"
    },
    {
      exam: "DBT BET",
      topic: "Biosensors",
      question: "Which optical biosensing technique measures subtle changes in the refractive index near a noble metal film surface caused by biomolecular binding?",
      options: JSON.stringify(["Surface Plasmon Resonance (SPR)", "Fluorescence Resonance Energy Transfer (FRET)", "Circular Dichroism (CD)", "Dynamic Light Scattering (DLS)"]),
      correct_answer: 0,
      explanation: "Surface Plasmon Resonance (SPR) detects label-free real-time molecular interactions by measuring resonance angle shifts corresponding to refractive index changes on gold sensor chips.",
      concept: "Surface Plasmon Resonance (SPR) Bio-transduction",
      difficulty: "Medium"
    },
    {
      exam: "CSIR/DBT JRF",
      topic: "Genetics",
      question: "In CRISPR-Cas9 genome editing, what short nucleotide sequence must be located immediately 3' to the target DNA sequence for Cas9 binding?",
      options: JSON.stringify(["TATA Box", "Shine-Dalgarno Sequence", "Protospacer Adjacent Motif (PAM)", "Poly-A Tail"]),
      correct_answer: 2,
      explanation: "The Protospacer Adjacent Motif (PAM), typically 5'-NGG-3' for SpCas9, is mandatory for Cas9 recognition, strand invasion, and double-strand cleaving.",
      concept: "CRISPR-Cas9 Mechanism & PAM Recognition",
      difficulty: "Hard"
    }
  ];

  for (const q of compQuestions) {
    database.run(
      `INSERT INTO competitive_questions (exam, topic, question, options, correct_answer, explanation, concept, difficulty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [q.exam, q.topic, q.question, q.options, q.correct_answer, q.explanation, q.concept, q.difficulty]
    );
  }
  console.log('✅ Seeded APD EQUILEARN competitive questions');
}

function seedBiotechExperiments(database) {
  const experiments = [
    {
      title: "PCR Amplification & Agarose Gel Electrophoresis",
      category: "Genetics & Molecular Biology",
      aim: "Amplify target DNA loci using Taq DNA Polymerase and resolve amplified molecular weight fragments on a 1.2% agarose gel.",
      materials: JSON.stringify([
        "Template DNA sample (10 ng/uL)",
        "Forward & Reverse Primers (10 uM)",
        "2x Master Mix (Taq Polymerase, dNTPs, MgCl2, Buffer)",
        "Nuclease-free UltraPure Water",
        "Agarose Powder (Biotech grade)",
        "1x TAE Running Buffer",
        "Ethidium Bromide / GelRed Nucleic Acid Stain",
        "100 bp DNA Molecular Weight Ladder",
        "Thermocycler & Electrophoresis Unit with UV Transilluminator"
      ]),
      procedure_steps: JSON.stringify([
        { step: 1, title: "Reaction Master Mix Preparation", detail: "Pipette 12.5 uL 2x Master Mix, 1 uL Forward Primer, 1 uL Reverse Primer, 2 uL Template DNA, and 8.5 uL Nuclease-free water into a 0.2 mL PCR tube." },
        { step: 2, title: "Thermal Cycling Program", detail: "Load tube into thermocycler: Initial Denaturation 95°C for 3 min; 35 cycles of (Denaturation 95°C 30s, Annealing 58°C 30s, Extension 72°C 45s); Final Extension 72°C 5 min." },
        { step: 3, title: "Agarose Gel Preparation", detail: "Weigh 0.6 g agarose into 50 mL 1x TAE buffer (1.2% w/v). Microwave to dissolve completely, cool to 55°C, add 3 uL GelRed stain, and pour into gel casting tray with comb." },
        { step: 4, title: "Sample Loading & Electrophoresis", detail: "Submerge gel in TAE running buffer. Load 5 uL 100bp DNA Ladder into Lane 1 and 10 uL PCR reaction mix with loading dye into Lanes 2-5. Run at 100V constant voltage for 45 min." },
        { step: 5, title: "UV Transillumination Imaging", detail: "Place gel on UV transilluminator (302 nm). Capture fluorescent band patterns and determine amplicon size relative to the ladder." }
      ]),
      biosensor_biomarker_data: JSON.stringify({
        target: "500 bp DNA Amplicon",
        biomarker: "Amplified Target Gene Locus",
        concentration_ng_ul: 45.2,
        realtime_qPCR_CT: 22.4,
        band_size_bp: 500,
        fluorescence_RFU: 8450
      }),
      simplified_beginner: "PCR works like a molecular photocopier that makes millions of copies of a single gene so we can see it as a bright glowing line on an agarose gel ladder.",
      simplified_intermediate: "Polymerase Chain Reaction uses thermal cycling to repeatedly melt double-stranded DNA, anneal specific oligonucleotide primers, and synthesize complementary strands via heat-stable Taq DNA polymerase.",
      simplified_advanced: "Exponential amplification (2^n) of target loci yields high-density amplicons resolved by agarose gel electrophoresis, where fragments migrate toward the positive anode inversely proportional to the log of their molecular weight."
    },
    {
      title: "Amperometric Electrochemical Glucose Biosensor Fabrication & Calibration",
      category: "Biosensors & Bioelectronics",
      aim: "Immobilize Glucose Oxidase (GOD) onto screen-printed carbon electrodes (SPCE) and record real-time catalytic oxidation current vs glucose concentration.",
      materials: JSON.stringify([
        "Screen-Printed Carbon Electrodes (SPCE with Ag/AgCl reference)",
        "Glucose Oxidase (GOD from Aspergillus niger, 200 U/mg)",
        "Chitosan Biopolymer (0.5% w/v in 1% acetic acid)",
        "Glutaraldehyde Crosslinker (0.25% v/v)",
        "0.1 M Phosphate Buffer Solution (PBS pH 7.4)",
        "D-Glucose Standard Stock Solution (100 mM)",
        "Electrochemical Potentiostat Workstation"
      ]),
      procedure_steps: JSON.stringify([
        { step: 1, title: "Biomembrane Coating Solution", detail: "Dissolve 5 mg Glucose Oxidase in 1 mL 0.5% Chitosan solution under gentle stirring to form a homogenous bio-functional matrix." },
        { step: 2, title: "Electrode Drop-Casting", detail: "Pipette 5 uL of enzyme-chitosan matrix onto the working electrode surface of the SPCE. Expose to glutaraldehyde vapor for 10 minutes to crosslink." },
        { step: 3, title: "Biocatalytic Membrane Curing", detail: "Allow the modified electrode to dry at 4°C overnight to establish a robust enzymatic matrix." },
        { step: 4, title: "Potentiometric Setup & Baseline", detail: "Immerse SPCE into 10 mL stirring PBS buffer cell connected to the potentiostat. Apply constant polarization potential of +0.60 V vs Ag/AgCl until steady baseline current is achieved." },
        { step: 5, title: "Glucose Calibration Curve", detail: "Inject sequential 100 uL aliquots of glucose stock (adding 2 mM to 20 mM increments). Record steady-state oxidation current step response." }
      ]),
      biosensor_biomarker_data: JSON.stringify({
        target: "Blood Glucose (D-Glucose)",
        biomarker: "Hydrogen Peroxide (H2O2) Oxidation Current",
        sensitivity_uA_mM: 4.8,
        linear_range_mM: "1.0 - 18.0 mM",
        correlation_R2: 0.998,
        baseline_current_uA: 0.35,
        response_time_sec: 4.2
      }),
      simplified_beginner: "Glucose Oxidase turns sugar into electricity on a small sensor chip. The higher the sugar level, the stronger the electric spark!",
      simplified_intermediate: "Glucose Oxidase catalyzes the oxidation of glucose to gluconic acid and H2O2. H2O2 is electrochemically oxidized at +0.6V at the electrode, yielding an electrical current proportional to glucose concentration.",
      simplified_advanced: "Enzymatic biocatalysis coupled with amperometric transduction yields Michaelis-Menten current response curves (I_max = 86.4 uA, K_m = 6.2 mM) governed by heterogeneous electron transfer kinetics at the electrode interface."
    },
    {
      title: "Sandwich ELISA Biomarker Quantification for Interleukin-6 (IL-6)",
      category: "Biomedical & Immunodiagnostics",
      aim: "Quantify picogram concentrations of serum interleukin-6 (IL-6) inflammatory biomarker using sandwich Enzyme-Linked Immunosorbent Assay.",
      materials: JSON.stringify([
        "96-well Microtiter Plate pre-coated with Anti-IL-6 Monoclonal Capture Antibody",
        "Recombinant Human IL-6 Standard (0 to 500 pg/mL)",
        "Biotinylated Anti-Human IL-6 Detection Antibody",
        "Streptavidin-HRP Conjugate",
        "TMB Chromogenic Substrate Solution",
        "Stop Solution (2 M H2SO4)",
        "Wash Buffer (1x PBST: PBS + 0.05% Tween-20)",
        "Microplate Absorbance Spectrophotometer (450 nm)"
      ]),
      procedure_steps: JSON.stringify([
        { step: 1, title: "Sample & Standard Addition", detail: "Pipette 100 uL of IL-6 standards and patient serum samples into pre-coated capture antibody wells. Cover plate and incubate at room temperature for 2 hours." },
        { step: 2, title: "Washing Unbound Biomolecules", detail: "Aspirate well contents and wash 4 times with 300 uL PBST wash buffer to remove non-specifically bound serum proteins." },
        { step: 3, title: "Biotinylated Detection Antibody", detail: "Add 100 uL of Biotinylated anti-IL-6 detection antibody to each well; incubate for 1 hour at room temp, then wash 4 times." },
        { step: 4, title: "Streptavidin-HRP Signal Amplification", detail: "Add 100 uL Streptavidin-HRP conjugate solution; incubate for 30 minutes in the dark, followed by 5 thorough wash cycles." },
        { step: 5, title: "Color Development & Spectrophotometry", detail: "Add 100 uL TMB substrate (blue color develops); incubate 15 mins. Add 50 uL Stop Solution (turns yellow); read absorbance at 450 nm within 30 minutes." }
      ]),
      biosensor_biomarker_data: JSON.stringify({
        target: "Interleukin-6 (IL-6 Cytokine)",
        biomarker: "Inflammatory Cytokine Biomarker",
        sample_concentration_pg_ml: 14.8,
        absorbance_450nm_OD: 0.865,
        linear_range_pg_ml: "3.12 - 200 pg/mL",
        detection_limit_pg_ml: 1.6
      }),
      simplified_beginner: "ELISA uses Y-shaped antibody traps and a color-changing enzyme to measure tiny immune protein signals in blood droplets.",
      simplified_intermediate: "Sandwich ELISA captures the target cytokine between an immobilized primary antibody and a biotinylated detection antibody, using HRP enzyme to convert substrate into a colored product measured by light absorbance.",
      simplified_advanced: "Specific divalent immunocomplex formation provides high analytical specificity with optical detection sensitivity reaching the picogram per milliliter (10^-12 g/mL) regime."
    },
    {
      title: "Label-Free Aptamer Binding Kinetics via Surface Plasmon Resonance (SPR)",
      category: "Biosensors & Biophysics",
      aim: "Measure real-time association and dissociation binding kinetics (Kd) of RNA aptamers to Estradiol (E2) biomarker on a gold sensor chip using SPR spectroscopy.",
      materials: JSON.stringify([
        "Gold-coated SPR Sensor Chip (SIA Kit Au)",
        "11-Mercaptoundecanoic acid (MUA, 10 mM in ethanol)",
        "EDC/NHS Coupling Reagents (0.4 M EDC / 0.1 M NHS)",
        "Amine-functionalized RNA Aptamer targeting Estradiol (1 uM)",
        "Ethanolamine Deactivation Solution (1 M pH 8.5)",
        "Estradiol (E2) Standard Solutions (10 nM to 1 uM in HBS-EP buffer)",
        "Dual-Channel SPR Spectrometer System"
      ]),
      procedure_steps: JSON.stringify([
        { step: 1, title: "Gold Surface Functionalization", detail: "Clean gold chip with piranha solution; submerge in MUA solution for 16 hours to form an ordered carboxyl-terminated self-assembled monolayer (SAM)." },
        { step: 2, title: "EDC/NHS Amine Coupling Activation", detail: "Dock chip into SPR system. Inject 1:1 EDC/NHS mixture over flow cell 1 at 10 uL/min for 7 minutes to form reactive NHS-ester intermediates." },
        { step: 3, title: "Aptamer Immobilization", detail: "Inject amine-modified E2 RNA aptamer (1 uM in 10 mM sodium acetate pH 4.5) for 10 minutes; record covalent ligand binding signal shift." },
        { step: 4, title: "Deactivation of Unreacted Sites", detail: "Inject 1 M Ethanolamine (pH 8.5) for 7 minutes to block remaining active NHS esters and stabilize baseline Resonance Units (RU)." },
        { step: 5, title: "Analytes Binding Kinetics Run", detail: "Inject sequential concentrations of Estradiol (10 nM to 1 uM) at 30 uL/min flow rate. Record sensorgram association (3 min) and dissociation (5 min) curves." }
      ]),
      biosensor_biomarker_data: JSON.stringify({
        target: "Estradiol (E2 Steroid Hormone)",
        biomarker: "Endocrine Biomarker",
        resonance_shift_RU: 154.2,
        association_rate_ka: "1.45 x 10^5 M^-1 s^-1",
        dissociation_rate_kd: "5.8 x 10^-4 s^-1",
        equilibrium_affinity_KD_nM: 4.0
      }),
      simplified_beginner: "Light reflects off a gold chip. When hormone molecules stick to RNA magnet probes on the gold, the reflected light angle shifts in real time!",
      simplified_intermediate: "SPR measures refractive index shifts resulting from mass accumulation near a gold surface as target Estradiol binds immobilized RNA aptamers in real time.",
      simplified_advanced: "Surface plasmon wave resonance angle shifts (delta-theta_SPR) are proportional to surface excess mass, allowing direct computation of kinetic rate constants and thermodynamic binding affinity (K_d = k_d / k_a = 4.0 nM)."
    }
  ];

  for (const e of experiments) {
    database.run(
      `INSERT INTO biotech_experiments (title, category, aim, materials, procedure_steps, biosensor_biomarker_data, simplified_beginner, simplified_intermediate, simplified_advanced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [e.title, e.category, e.aim, e.materials, e.procedure_steps, e.biosensor_biomarker_data, e.simplified_beginner, e.simplified_intermediate, e.simplified_advanced]
    );
  }
  console.log('✅ Seeded APD EQUILEARN virtual biotechnology experiments');
}

module.exports = { getDb, initializeDatabase, run, get, all, saveDb };
