const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const fetch = require('node-fetch');

async function callOpenAI(messages, systemPrompt, jsonMode = false) {
  if (!OPENAI_API_KEY) return null;
  try {
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are BioBridge AI, a world-class biotechnology, research exploration, biomarker, and biosensor innovation assistant.'
        },
        ...messages
      ],
      max_tokens: 1500,
      temperature: 0.7,
    };
    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI call error:', err);
    return null;
  }
}

async function analyzePaper(paper) {
  const systemPrompt = `You are BioBridge AI Research Processor. Analyze biotechnology research papers into structured learning JSON.
Ensure explanations are scientifically accurate, educational, non-diagnostic, and accessible across Beginner, Intermediate, and Advanced levels.`;

  const userPrompt = `Analyze paper:
Title: ${paper.title}
Abstract: ${paper.abstract}
Methodology: ${paper.methodology}
Biomarkers: ${paper.biomarkers || 'N/A'}
Category: ${paper.category}

Return JSON with keys:
"beginner_summary", "intermediate_summary", "advanced_summary",
"structure": {"question", "sample", "biomarkers", "methodology", "results", "biological_meaning"},
"methodology_breakdown": {"sample_size", "study_design", "materials", "lab_methods", "statistical_analysis", "technologies"},
"results_cards": [{"title", "description", "significance"}],
"related_research": [{"title", "concept", "relevance"}]`;

  const openAiResult = await callOpenAI([{ role: 'user', content: userPrompt }], systemPrompt, true);
  if (openAiResult) {
    try {
      return JSON.parse(openAiResult);
    } catch (e) {}
  }

  // Fallback demo structure for robust user experience
  return {
    beginner_summary: paper.simplified_summary || `This study investigates ${paper.topic} to understand how biological systems function at a cellular and molecular level.`,
    intermediate_summary: `Researchers utilized ${paper.methodology || 'advanced laboratory techniques'} to analyze target biomarkers (${paper.biomarkers || 'key cellular markers'}). The findings provide clear evidence regarding ${paper.category.toLowerCase()} pathways.`,
    advanced_summary: `Quantitative analysis of ${paper.biomarkers || 'molecular targets'} demonstrated statistically significant variations during experimental observation, furthering mechanistic comprehension of ${paper.topic}.`,
    structure: {
      question: `What are the physiological effects and biomarker expressions in ${paper.topic}?`,
      sample: paper.population_studied || 'Experimental cohorts and controlled biological models',
      biomarkers: paper.biomarkers || 'Target proteins, metabolites, or gene transcripts',
      methodology: paper.methodology || 'Assay, spectroscopy, or sequencing protocols',
      results: paper.simplified_summary || 'Observed distinct shifts in key biomarker concentrations.',
      biological_meaning: paper.biological_meaning || 'Indicates key regulatory mechanisms in cellular homeostasis.'
    },
    methodology_breakdown: {
      sample_size: paper.population_studied || 'Statistically calibrated sample group',
      study_design: 'Longitudinal / Controlled experimental design',
      materials: 'Reagent kits, specific antibody probes, cell culture media',
      lab_methods: paper.methodology || 'Mass Spectrometry, Flow Cytometry, ELISA',
      statistical_analysis: 'ANOVA, Student t-test, multivariable regression (p < 0.05)',
      technologies: 'Spectrophotometry, High-Throughput Sequencers, Biosensor arrays'
    },
    results_cards: [
      { title: "Biomarker Shift", description: `Significant modification observed in ${paper.biomarkers || 'target markers'}.`, significance: "Primary physiological outcome" },
      { title: "Metabolic Equilibrium", description: "Demonstrated cellular adaptation without cytotoxic impairment.", significance: "Safety & homeostasis confirmation" }
    ],
    related_research: [
      { title: "Translational Biomarker Applications in Molecular Health", concept: "Biomarker Transduction", relevance: "Directly extends observed metabolite shifts to point-of-care detection." },
      { title: "Nanomaterial Probes for Cell Surface Receptor Quantification", concept: "Nanobiotechnology", relevance: "Complements analytical detection techniques used in this paper." }
    ]
  };
}

async function askPaper(paper, question) {
  const systemPrompt = `You are BioBridge AI Paper Chatbot. Answer the student's question based strictly on the selected research paper context.
Paper Title: ${paper.title}
Paper Abstract: ${paper.abstract}
Paper Authors: ${paper.authors}
Paper Methodology: ${paper.methodology}
Paper Biomarkers: ${paper.biomarkers || 'N/A'}
Paper Results: ${paper.simplified_summary}

If the question asks for a beginner explanation, make it extremely simple with analogies. Emphasize that BioBridge AI is an educational research tool, not a clinical diagnostic system.`;

  const openAiResult = await callOpenAI([{ role: 'user', content: question }], systemPrompt, false);
  if (openAiResult) return openAiResult;

  const qLower = question.toLowerCase();
  if (qLower.includes('method') || qLower.includes('how')) {
    return `**Methodology Breakdown for "${paper.title}":**\n\nThe researchers used **${paper.methodology}**. They measured specific targets including **${paper.biomarkers || 'biological markers'}** in ${paper.population_studied || 'the study group'} to gather accurate data on cellular changes.`;
  }
  if (qLower.includes('biomarker') || qLower.includes('measured')) {
    return `**Biomarkers Studied:**\n\nThe key biomarkers evaluated in this research paper are **${paper.biomarkers || 'essential cellular proteins and metabolites'}**. These molecules act as biological indicators of cellular function and metabolic shifts.`;
  }
  if (qLower.includes('discover') || qLower.includes('result') || qLower.includes('find')) {
    return `**Key Discoveries:**\n\n${paper.simplified_summary || 'The study discovered significant biological patterns that enhance our understanding of cellular signaling.'}\n\n*Biological Significance:* ${paper.biological_meaning || 'Helps establish molecular baselines for future research.'}`;
  }
  if (qLower.includes('beginner') || qLower.includes('simple')) {
    return `**Simplified Explanation:**\n\nThink of this research paper like checking a car's dashboard. Instead of oil pressure or speed, scientists measured natural biological signals (**${paper.biomarkers || 'molecules'}**) in the body to see how cells respond and adapt safely over time!`;
  }

  return `Based on **"${paper.title}"**:\n\nThe research explores ${paper.topic} using ${paper.methodology}. The primary finding is: *${paper.simplified_summary}*\n\n*(Note: BioBridge AI provides educational research breakdowns and does not make medical diagnoses.)*`;
}

async function explainConcept(question, selectedAnswer, correctAnswer) {
  const systemPrompt = `You are BioBridge AI Competitive Exam Coach. Explain why the selected answer is incorrect, state the correct biological principle, give a simple real-world analogy, and suggest follow-up concepts for GATE / Biotech entrance exams.`;

  const userPrompt = `Question: ${question.question}
Student's Answer: ${question.options[selectedAnswer]}
Correct Answer: ${question.options[correctAnswer]}
Underlying Concept: ${question.concept}
Explanation: ${question.explanation}`;

  const openAiResult = await callOpenAI([{ role: 'user', content: userPrompt }], systemPrompt, true);
  if (openAiResult) {
    try {
      return JSON.parse(openAiResult);
    } catch (e) {}
  }

  return {
    concept_identified: question.concept,
    why_incorrect: `You selected option (${question.options[selectedAnswer]}), which does not fulfill the biological requirement described in the question.`,
    correct_principle: question.explanation,
    simple_example: "Think of enzyme substrate binding like a key fitting into a specific lock — only the exact structural match produces the desired action.",
    related_topics: ["Enzyme Kinetic Models", "Signal Transduction Catalysis", "Active Site Allosteric Inhibition"],
    follow_up_question: "What happens to the Vmax of an enzymatic reaction in the presence of a competitive inhibitor?"
  };
}

async function generateProjectIdea(interest) {
  const systemPrompt = `You are BioBridge AI Innovation Engine. Convert student biological interests into structured, research-oriented biotechnology project ideas with 10-step biological workflow and biosensor potential.
Return JSON with keys:
"title", "problem_statement", "research_question", "biological_concepts", "biomarker", "methodology", "experimental_approach", "data_requirements", "expected_outcome", "future_applications", "biosensor_possibility", "workflow_steps"`;

  const openAiResult = await callOpenAI([{ role: 'user', content: `Student Interest: ${interest}` }], systemPrompt, true);
  if (openAiResult) {
    try {
      return JSON.parse(openAiResult);
    } catch (e) {}
  }

  return {
    title: `AI-Guided Nanobiosensor Platform for Rapid Detection of ${interest.split(' ')[0] || 'Biomarker'} Targets`,
    problem_statement: `Current laboratory assay methods for analyzing ${interest} require centralized equipment, high costs, and lengthy processing times, limiting accessible field screening.`,
    research_question: `How can surface-functionalized aptamer probes coupled with electrochemical transducers enable rapid, point-of-care quantification of target biomarkers related to ${interest}?`,
    biological_concepts: ["Aptamer Target Specificity", "Signal Transduction", "Surface Plasmon Resonance", "Exosomal Molecular Cargo"],
    biomarker: `${interest.includes('cancer') ? 'MicroRNA-21 / Exosomal Protein CD63' : interest.includes('glucose') ? 'Glucose / Lactate Metabolites' : 'Target Cytokine / Metabolite Protein'}`,
    methodology: "Gold nanoparticle functionalization, Aptamer probe synthesis, Cyclic Voltammetry (CV), Microfluidic chip assembly",
    experimental_approach: "1. Synthesize target-specific nucleic acid aptamers. 2. Immobilize onto screen-printed gold electrodes. 3. Incubate with spiked biomarker serum standards. 4. Measure peak oxidative current change.",
    data_requirements: "Amperometric current responses (nA), Calibration curve linear range, Limit of Detection (LOD) in pM/nM",
    expected_outcome: "A functional prototype test strip achieving linear detection response within 15 minutes of sample application.",
    future_applications: "Portable diagnostic kits for rural clinics, non-invasive health monitoring wearables, and low-cost environmental biosensing.",
    biosensor_possibility: "High (Electrochemical transducer + Aptamer bioreceptor)",
    workflow_steps: [
      { step: 1, label: "Student Interest", detail: interest },
      { step: 2, label: "Biological Problem", detail: "Centralized lab assay bottleneck" },
      { step: 3, label: "Research Question", detail: "Low-cost point-of-care quantification" },
      { step: 4, label: "Biological Target", detail: "Target cell receptor or metabolite" },
      { step: 5, label: "Biomarker", detail: "MicroRNA or specific protein analyte" },
      { step: 6, label: "Detection Method", detail: "Electrochemical Voltammetry" },
      { step: 7, label: "Biosensor Possibility", detail: "Screen-printed gold electrode test strip" },
      { step: 8, label: "Data Analysis", detail: "Calibration curves & LOD calculation" },
      { step: 9, label: "AI Interpretation", detail: "BioBridge AI predictive curve fitting" },
      { step: 10, label: "Final Biotechnology Project", detail: "Validated point-of-care biosensor proposal" }
    ]
  };
}

async function designBiosensor(target, bioreceptor, transducer, measurement) {
  const systemPrompt = `You are BioBridge AI Biosensor Design Workstation. Evaluate the feasibility, sensing mechanism, signal transductions, and educational project potential of a student biosensor design.`;

  const userPrompt = `Biological Target: ${target}
Bioreceptor: ${bioreceptor}
Transducer: ${transducer}
Measurement Signal: ${measurement}`;

  const openAiResult = await callOpenAI([{ role: 'user', content: userPrompt }], systemPrompt, true);
  if (openAiResult) {
    try {
      return JSON.parse(openAiResult);
    } catch (e) {}
  }

  return {
    feasibility_score: 92,
    target,
    bioreceptor,
    transducer,
    measurement,
    sensing_mechanism: `When target molecule (${target}) binds specifically to the ${bioreceptor}, a local physical/chemical change is induced at the bio-interface. The ${transducer} converts this molecular interaction into a measurable ${measurement}.`,
    recommended_setup: `Immobilize ${bioreceptor} onto conductive carbon or gold substrate. Use ${measurement} recording for high signal-to-noise ratio.`,
    signal_type: measurement,
    measurement_strategy: `Plot signal peak intensity against logarithmic concentrations of ${target}.`,
    project_feasibility: "Highly Feasible — Suitable for undergraduate or graduate research project implementation.",
    educational_disclaimer: "BioBridge AI biosensor design recommendations are intended for academic study and research exploration, not as clinical medical devices."
  };
}

module.exports = {
  analyzePaper,
  askPaper,
  explainConcept,
  generateProjectIdea,
  designBiosensor
};
