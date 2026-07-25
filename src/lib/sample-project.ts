import type { ProjectInput } from "@/types/project";

export const SAMPLE_PROJECT: ProjectInput = {
  projectName: "Mobile Banking App Launch",
  projectType: "Software",
  projectDump: `We are 4 months into a 6-month launch of a new mobile banking app for retail customers.
Two of five backend microservices (accounts, transactions) are still failing load tests at 2x expected traffic.
The compliance team flagged four unresolved findings around KYC and transaction monitoring last Friday.
Our lead iOS engineer left three weeks ago and the replacement starts next month.
Marketing has already booked TV spots for the launch date and the CMO refuses to move it.
Budget is 78% consumed but only ~55% of committed scope is production-ready.
Standups feel heavy — the team is doing weekend work and morale is visibly dropping.
Stakeholder updates have been ad-hoc; the sponsor complained yesterday about "surprises".
Open risks in the register: performance, compliance, key-person dependency, vendor SDK stability.`,
  indicators: {
    progress: 55,
    budgetUtilization: 78,
    timelineCompletion: 72,
    teamStress: 78,
    stakeholderSatisfaction: 42,
    openRisks: 8,
    priority: "High",
  },
};
