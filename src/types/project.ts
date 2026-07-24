export type ProjectType =
  | "Software"
  | "Construction"
  | "NGO"
  | "Research"
  | "Marketing"
  | "Event"
  | "Business"
  | "Education";

export type Priority = "Low" | "Medium" | "High";

export interface ProjectIndicators {
  progress: number;
  budgetUtilization: number;
  timelineCompletion: number;
  teamStress: number;
  stakeholderSatisfaction: number;
  openRisks: number;
  priority: Priority;
}

export interface ProjectInput {
  projectName: string;
  projectType: ProjectType;
  projectDump: string;
  indicators: ProjectIndicators;
  scenario?: string;
}

export interface Recommendation {
  title: string;
  reason: string;
  priority: Priority;
  expectedImpact: string;
}

export interface AnalysisResult {
  projectRecoveryIndex: number;
  status: string;
  confidence: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskCategories: string[];
  rootCause: string[];
  recommendations: Recommendation[];
  checklist: string[];
  executiveSummary: string;
  stakeholderEmail: { subject: string; body: string };
  assumptions: string[];
  missingInformation: string[];
  lessonsLearned: string[];
}

export interface HistoryRecord {
  id: string;
  createdAt: string;
  input: ProjectInput;
  result: AnalysisResult;
}
