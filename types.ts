
export interface Resource {
  title: string;
  type: 'paper' | 'video' | 'article' | 'repo' | 'tool';
  description: string;
  url: string;
}

export interface ConceptNode {
  name: string;
  description: string;
  complexity: 'Low' | 'Medium' | 'High';
}

export interface TechItem {
  category: string;
  tools: string[];
  reason: string;
}

export interface RevenueData {
  year: string;
  amount: number; // e.g. 50, 100, 200 (k or m)
  unit: string;   // e.g. "$K" or "$M"
}

export interface MarketSegment {
  segment: string;
  percentage: number;
}

export interface DomainMetric {
  title: string;
  type: 'bar' | 'pie' | 'line' | 'stat' | 'radar';
  data: { label: string; value: number }[];
  summary: string;
}

export interface MarketAnalysis {
  targetAudience: string;
  keyCompetitors: string[];
  currentTrends: string[];
  totalAddressableMarket: string;
  projectedRevenue: RevenueData[];
  marketSegments: MarketSegment[];
}

export interface UserFeedbackAnalysis {
  commonComplaints: string[];
  praisePoints: string[];
  userExpectations: string[];
}

export interface ScopeRecommendation {
  coreFeatures: string[]; // Must haves
  optionalFeatures: string[]; // Nice to haves
  outOfScope: string[]; // What to remove
}

export interface WorkflowNode {
  id: string;
  label: string;
  type: 'user' | 'system' | 'data' | 'action';
  details: string;
  userNotes?: string;
  aiSuggestions?: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface StickyNote {
  id: string;
  x: number;
  y: number;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink';
}

export interface Point {
  x: number;
  y: number;
}

export interface Drawing {
  id: string;
  type: 'freehand' | 'line';
  points: Point[];
  color: string;
}

export interface AppWorkflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  stickyNotes?: StickyNote[];
  drawings?: Drawing[];
}

export interface PromptStep {
  id: string;
  step: number;
  title: string;
  prompt: string;
  status: 'pending' | 'completed';
  userOutput?: string;
  aiFeedback?: string;
}

export interface Blueprint {
  title: string;
  summary: string;
  domain: string;
  
  // Analysis
  marketAnalysis: MarketAnalysis;
  strategicInsights: DomainMetric[]; // Dynamic Domain Charts
  userSentiment: UserFeedbackAnalysis;
  scope: ScopeRecommendation;

  // Technical
  coreConcepts: ConceptNode[];
  techStack: TechItem[];
  
  appWorkflow: AppWorkflow; // System Architecture ("How it works")
  implementationWorkflow: AppWorkflow; // Build Steps ("How to build it")

  risksAndLiabilities: string[];
  recommendedResources: Resource[];
  
  // Optional context
  clarifyingQuestions?: string[];
  
  // Prompt Generation
  promptPlan?: PromptStep[];
}

export interface ClarificationResponse {
  questions: string[];
  isClarificationNeeded: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  createdAt: number;
  blueprint: Blueprint;
  chatHistory: ChatMessage[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',     // Checking if we need questions
  CLARIFYING = 'CLARIFYING',   // User answering questions
  GENERATING = 'GENERATING',   // Generating full blueprint
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
