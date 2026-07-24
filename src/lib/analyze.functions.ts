import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import type { AnalysisResult, ProjectInput } from "@/types/project";

const IndicatorsSchema = z.object({
  progress: z.number(),
  budgetUtilization: z.number(),
  timelineCompletion: z.number(),
  teamStress: z.number(),
  stakeholderSatisfaction: z.number(),
  openRisks: z.number(),
  priority: z.enum(["Low", "Medium", "High"]),
});

const InputSchema = z.object({
  projectName: z.string().min(1).max(200),
  projectType: z.string().min(1).max(60),
  projectDump: z.string().max(20000).optional().default(""),
  indicators: IndicatorsSchema,
  scenario: z.string().max(500).optional(),
});

const SYSTEM_PROMPT = `You are a Senior PMP-certified Project Management Consultant.
Analyze the provided project information using professional project management practices (PMBOK).
Return ONLY a JSON object matching the schema requested. Do NOT include markdown fences.
Always explain WHY each recommendation is suggested. Provide a confidence score (0-100).
If important information is missing, list it in "missingInformation" and state assumptions clearly.
Never fabricate facts. Recommend actions instead of making final decisions.
Remind the user AI supports — not replaces — professional judgment (implicit).`;

function buildPrompt(input: ProjectInput) {
  const i = input.indicators;
  return `Project Name: ${input.projectName}
Project Type: ${input.projectType}

Quantitative Indicators:
- Progress: ${i.progress}%
- Budget Utilization: ${i.budgetUtilization}%
- Timeline Completion: ${i.timelineCompletion}%
- Team Stress (0-100, higher=worse): ${i.teamStress}
- Stakeholder Satisfaction (0-100, higher=better): ${i.stakeholderSatisfaction}
- Number of Open Risks: ${i.openRisks}
- Priority: ${i.priority}

Project Notes / Dump:
${input.projectDump || "(none provided)"}

${input.scenario ? `\nRECOVERY SCENARIO TO SIMULATE: "${input.scenario}". Recalculate all outputs assuming this scenario has been applied.\n` : ""}

Return a JSON object with EXACTLY these keys:
{
  "projectRecoveryIndex": number 0-100,
  "status": "Healthy" | "Moderate Risk" | "Critical",
  "confidence": number 0-100,
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "riskCategories": string[] (from: "Schedule Risk","Budget Risk","Communication Risk","Stakeholder Risk","Scope Risk","Resource Risk","Quality Risk","Technical Risk"),
  "rootCause": string[] (max 4 concise bullets),
  "recommendations": [{"title": string, "reason": string, "priority": "Low"|"Medium"|"High", "expectedImpact": string}] (5-7 items),
  "checklist": string[] (6-10 actionable checklist items),
  "executiveSummary": string (2-3 professional paragraphs),
  "stakeholderEmail": {"subject": string, "body": string},
  "assumptions": string[],
  "missingInformation": string[],
  "lessonsLearned": string[] (4-6 items)
}`;
}

function mockResult(input: ProjectInput): AnalysisResult {
  const i = input.indicators;
  const scheduleGap = Math.max(0, i.timelineCompletion - i.progress);
  const budgetGap = Math.max(0, i.budgetUtilization - i.progress);
  let idx = 100 - scheduleGap * 0.8 - budgetGap * 0.7 - i.teamStress * 0.2 - i.openRisks * 3;
  idx += (i.stakeholderSatisfaction - 50) * 0.2;
  if (input.scenario?.includes("Extend")) idx += 8;
  if (input.scenario?.includes("Reduce Scope")) idx += 10;
  if (input.scenario?.includes("Budget")) idx += 6;
  if (input.scenario?.includes("Team")) idx += 5;
  if (input.scenario?.includes("Communication")) idx += 4;
  if (input.scenario?.includes("Freeze")) idx += 7;
  idx = Math.max(5, Math.min(98, Math.round(idx)));

  const riskLevel = idx > 75 ? "Low" : idx > 55 ? "Medium" : idx > 35 ? "High" : "Critical";
  const status = idx > 75 ? "Healthy" : idx > 45 ? "Moderate Risk" : "Critical";

  return {
    projectRecoveryIndex: idx,
    status,
    confidence: 72,
    riskLevel,
    riskCategories: [
      scheduleGap > 5 ? "Schedule Risk" : null,
      budgetGap > 5 ? "Budget Risk" : null,
      i.stakeholderSatisfaction < 60 ? "Stakeholder Risk" : null,
      i.teamStress > 60 ? "Resource Risk" : null,
      i.openRisks > 5 ? "Scope Risk" : null,
    ].filter(Boolean) as string[],
    rootCause: [
      scheduleGap > 5 ? `Timeline is ${scheduleGap.toFixed(0)}% ahead of actual progress.` : "Progress is broadly aligned with timeline.",
      budgetGap > 5 ? `Budget consumption exceeds progress by ${budgetGap.toFixed(0)}%.` : "Budget utilization is under control.",
      i.teamStress > 60 ? "Team stress is elevated — burnout risk is high." : "Team capacity appears sustainable.",
      i.openRisks > 5 ? `${i.openRisks} unresolved risks are actively affecting delivery.` : "Risk register is manageable.",
    ],
    recommendations: [
      { title: "Re-baseline the schedule", reason: "Current pace makes the committed timeline unachievable.", priority: "High", expectedImpact: "Restores realistic delivery expectations" },
      { title: "Introduce weekly budget variance review", reason: "Budget/progress delta indicates uncontrolled spend.", priority: "High", expectedImpact: "Reduces cost overrun by 10-20%" },
      { title: "Run a stakeholder alignment session", reason: "Satisfaction score suggests unmet expectations.", priority: "Medium", expectedImpact: "Improves buy-in and reduces late-stage change requests" },
      { title: "Freeze scope for next 2 sprints", reason: "Open risks compound when scope grows.", priority: "Medium", expectedImpact: "Focuses team on stabilization" },
      { title: "Introduce daily blocker triage", reason: "High stress + open risks indicate hidden blockers.", priority: "Medium", expectedImpact: "Reduces cycle time" },
    ],
    checklist: [
      "Publish updated project baseline",
      "Meet each stakeholder 1:1 this week",
      "Close or defer top 3 risks",
      "Review resource allocation with team leads",
      "Communicate revised milestones to sponsors",
      "Schedule mid-project retrospective",
    ],
    executiveSummary: `${input.projectName} is currently rated at a Recovery Index of ${idx} (${status}). The primary drivers are ${scheduleGap > 5 ? "schedule slippage" : "budget pressure"} and ${i.teamStress > 60 ? "elevated team stress" : "stakeholder alignment"}. Recommended focus for the next two weeks is stabilization: re-baseline, freeze scope, and re-engage stakeholders. With disciplined execution, the project can be returned to a healthy trajectory within 3-4 weeks.\n\nNote: This is an AI-generated preliminary analysis. Final decisions should rely on professional judgment.`,
    stakeholderEmail: {
      subject: `${input.projectName} — Recovery Plan & Next Steps`,
      body: `Hi team,\n\nFollowing a structured review of ${input.projectName}, we have identified a Recovery Index of ${idx}/100 (${status}). The main drivers are a delta between timeline and delivered progress, and open risks that require immediate attention.\n\nOver the next two weeks we will (1) re-baseline the schedule, (2) freeze scope, and (3) hold focused stakeholder alignment sessions. I will share an updated status by end of week.\n\nPlease reach out if you have questions or additional context that would strengthen the plan.\n\nBest regards,\nProject Lead`,
    },
    assumptions: [
      "Indicator values reflect the current week",
      "No major regulatory or external blockers beyond those noted",
      "Team composition remains stable during recovery",
    ],
    missingInformation: [
      "Detailed risk register with impact/probability",
      "Historical velocity or earned value data",
      "Contract or scope constraints",
    ],
    lessonsLearned: [
      "Conduct weekly risk reviews",
      "Track earned value alongside progress",
      "Improve stakeholder communication cadence",
      "Enforce change control for scope",
    ],
  };
}

export const analyzeProject = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => InputSchema.parse(raw))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return mockResult(data as ProjectInput);
    }
    try {
      const gateway = createLovableAiGatewayProvider(apiKey);
      const { text } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        system: SYSTEM_PROMPT,
        prompt: buildPrompt(data as ProjectInput),
        temperature: 0.4,
      });
      const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      const jsonStr = jsonStart >= 0 ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned;
      const parsed = JSON.parse(jsonStr) as AnalysisResult;
      return parsed;
    } catch (e) {
      console.error("AI analysis failed, using mock:", e);
      return mockResult(data as ProjectInput);
    }
  });
