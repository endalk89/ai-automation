export type StepType =
  | "TRIGGER"
  | "ACTION_EMAIL"
  | "ACTION_AI_PROMPT"
  | "ACTION_AI_CLASSIFY"
  | "ACTION_FILTER"
  | "ACTION_WEBHOOK";

export interface StepConfig {
  webhookUrl?: string; // For Webhook trigger
  emailTo?: string; // For email action
  emailSubject?: string; // For email action
  emailBody?: string; // Template string like {{trigger.message}}
  promptTemplate?: string; // AI Prompt template
  responseSchema?: 'text' | 'json' | 'classification';
  classifyCategories?: string[]; // E.g., ["billing", "technical", "other"]
  filterField?: string; // E.g., "trigger.sentiment"
  filterOperator?: "contains" | "equals" | "greater_than" | "less_than";
  filterValue?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  config: StepConfig;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  instructions: string;
  requiredSteps: StepType[];
  testInputs: Array<{
    label: string;
    data: Record<string, any>;
  }>;
  successCondition: string;
}

export interface Lesson {
  id: string;
  title: string;
  section: string;
  contentMarkdown: string;
  interactiveStep?: {
    goal: string;
    defaultSteps: WorkflowStep[];
    sampleInput: Record<string, any>;
    expectedSolutionExplanation: string;
  };
}

export interface SimulationLog {
  stepId: string;
  stepName: string;
  status: "success" | "failed";
  executionMs: number;
  logs: string[];
  output: Record<string, any>;
}
