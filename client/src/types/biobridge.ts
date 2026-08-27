export interface ResearchPaper {
  id: number;
  title: string;
  abstract: string;
  authors: string;
  publication_year: number;
  category: string;
  topic: string;
  methodology: string;
  biomarkers?: string;
  source?: string;
  url?: string;
  population_studied?: string;
  is_transgender_pathway?: number;
  is_autism_pathway?: number;
  simplified_summary?: string;
  biological_meaning?: string;
}

export interface PaperStructure {
  question: string;
  sample: string;
  biomarkers: string;
  methodology: string;
  results: string;
  biological_meaning: string;
}

export interface PaperAnalysis {
  beginner_summary: string;
  intermediate_summary: string;
  advanced_summary: string;
  structure: PaperStructure;
  methodology_breakdown: {
    sample_size: string;
    study_design: string;
    materials: string;
    lab_methods: string;
    statistical_analysis: string;
    technologies: string;
  };
  results_cards: Array<{
    title: string;
    description: string;
    significance: string;
  }>;
  related_research: Array<{
    title: string;
    concept: string;
    relevance: string;
  }>;
}

export interface Biomarker {
  name: string;
  type: 'Protein' | 'Hormone' | 'Metabolite' | 'Gene' | 'RNA' | 'Molecular Marker' | string;
  category: string;
  function: string;
  research_area: string;
  why_measured: string;
  detection_methods: string;
  biosensor_potential: string;
}

export interface CompetitiveQuestion {
  id: number;
  exam: string;
  topic: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  concept: string;
  difficulty: string;
}

export interface ConceptExplanation {
  concept_identified: string;
  why_incorrect: string;
  correct_principle: string;
  simple_example: string;
  related_topics: string[];
  follow_up_question: string;
}

export interface ProjectWorkflowStep {
  step: number;
  label: string;
  detail: string;
}

export interface ProjectIdea {
  id?: number;
  title: string;
  problem_statement: string;
  research_question: string;
  biological_concepts: string[];
  biomarker: string;
  methodology: string;
  experimental_approach: string;
  data_requirements: string;
  expected_outcome: string;
  future_applications: string;
  biosensor_possibility: string;
  workflow_steps: ProjectWorkflowStep[];
}

export interface BiosensorDesignResult {
  feasibility_score: number;
  target: string;
  bioreceptor: string;
  transducer: string;
  measurement: string;
  sensing_mechanism: string;
  recommended_setup: string;
  signal_type: string;
  measurement_strategy: string;
  project_feasibility: string;
  educational_disclaimer: string;
}

export interface ExperimentProcedureStep {
  step: number;
  title: string;
  detail: string;
}

export interface BiotechExperiment {
  id: number;
  title: string;
  category: string;
  aim: string;
  materials: string[];
  procedure_steps: ExperimentProcedureStep[];
  biosensor_biomarker_data: Record<string, any>;
  simplified_beginner: string;
  simplified_intermediate: string;
  simplified_advanced: string;
}
