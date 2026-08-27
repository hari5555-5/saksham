import axios from 'axios';
import {
  ResearchPaper,
  PaperAnalysis,
  Biomarker,
  CompetitiveQuestion,
  ConceptExplanation,
  ProjectIdea,
  BiosensorDesignResult
} from '../types/biobridge';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('saksham_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const biobridgeApi = {
  // Research
  getResearchPapers: async (params?: { category?: string; search?: string; transgender_pathway?: boolean; autism_pathway?: boolean }) => {
    const res = await axios.get<{ papers: ResearchPaper[] }>(`${API_BASE_URL}/biobridge/research`, {
      params: {
        ...params,
        transgender_pathway: params?.transgender_pathway ? '1' : undefined,
        autism_pathway: params?.autism_pathway ? '1' : undefined,
      }
    });
    return res.data.papers;
  },

  getPaperById: async (id: number) => {
    const res = await axios.get<{ paper: ResearchPaper }>(`${API_BASE_URL}/biobridge/research/${id}`);
    return res.data.paper;
  },

  uploadResearchPaper: async (data: Partial<ResearchPaper>) => {
    const res = await axios.post<{ paper: ResearchPaper }>(
      `${API_BASE_URL}/biobridge/research`,
      data,
      { headers: getAuthHeaders() }
    );
    return res.data.paper;
  },

  analyzePaper: async (paperId?: number, paperData?: ResearchPaper) => {
    const res = await axios.post<{ paper: ResearchPaper; analysis: PaperAnalysis }>(
      `${API_BASE_URL}/biobridge/research/analyze`,
      { paperId, paperData }
    );
    return res.data;
  },

  askPaper: async (paper: ResearchPaper, question: string) => {
    const res = await axios.post<{ answer: string }>(
      `${API_BASE_URL}/biobridge/research/ask`,
      { paper, question }
    );
    return res.data.answer;
  },

  // Competitive Exam Prep
  getCompetitiveQuestions: async (params?: { exam?: string; topic?: string }) => {
    const res = await axios.get<{ questions: CompetitiveQuestion[] }>(
      `${API_BASE_URL}/biobridge/competitive/questions`,
      { params }
    );
    return res.data.questions;
  },

  explainConcept: async (question: CompetitiveQuestion, selectedAnswer: number, correctAnswer: number) => {
    const res = await axios.post<{ explanation: ConceptExplanation }>(
      `${API_BASE_URL}/biobridge/competitive/explain`,
      { question, selectedAnswer, correctAnswer }
    );
    return res.data.explanation;
  },

  recordPerformance: async (questionId: number, answer: number, correct: boolean) => {
    const res = await axios.post(
      `${API_BASE_URL}/biobridge/competitive/performance`,
      { questionId, answer, correct },
      { headers: getAuthHeaders() }
    );
    return res.data;
  },

  getCompetitiveAnalytics: async () => {
    const res = await axios.get(
      `${API_BASE_URL}/biobridge/competitive/analytics`,
      { headers: getAuthHeaders() }
    );
    return res.data;
  },

  // Innovate Module
  generateProjectIdea: async (interest: string) => {
    const res = await axios.post<{ project: ProjectIdea }>(
      `${API_BASE_URL}/biobridge/innovate/generate-project`,
      { interest },
      { headers: getAuthHeaders() }
    );
    return res.data.project;
  },

  getSavedProjects: async () => {
    const res = await axios.get<{ projects: any[] }>(
      `${API_BASE_URL}/biobridge/innovate/projects`,
      { headers: getAuthHeaders() }
    );
    return res.data.projects;
  },

  // Biomarkers & Biosensors
  getBiomarkers: async (params?: { category?: string; search?: string }) => {
    const res = await axios.get<{ biomarkers: Biomarker[] }>(
      `${API_BASE_URL}/biobridge/biomarkers`,
      { params }
    );
    return res.data.biomarkers;
  },

  designBiosensor: async (target: string, bioreceptor: string, transducer: string, measurement: string) => {
    const res = await axios.post<{ design: BiosensorDesignResult }>(
      `${API_BASE_URL}/biobridge/biosensors/design`,
      { target, bioreceptor, transducer, measurement }
    );
    return res.data.design;
  },

  // Experiments Module
  getExperiments: async (params?: { category?: string; search?: string }) => {
    const res = await axios.get<{ experiments: any[] }>(
      `${API_BASE_URL}/biobridge/experiments`,
      { params }
    );
    return res.data.experiments;
  },

  getExperimentById: async (id: number) => {
    const res = await axios.get<{ experiment: any }>(
      `${API_BASE_URL}/biobridge/experiments/${id}`
    );
    return res.data.experiment;
  }
};
