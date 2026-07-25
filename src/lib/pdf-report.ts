import jsPDF from "jspdf";
import type { HistoryRecord } from "@/types/project";

const MARGIN = 48;
const LINE = 14;

export function downloadPdfReport(rec: HistoryRecord) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - MARGIN * 2;
  let y = MARGIN;

  const ensure = (needed = LINE) => {
    if (y + needed > pageH - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const text = (str: string, size = 10, bold = false, color: [number, number, number] = [30, 30, 40]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(str, contentW);
    for (const line of lines) {
      ensure(size + 4);
      doc.text(line, MARGIN, y);
      y += size + 4;
    }
  };

  const heading = (str: string) => {
    y += 6;
    ensure(22);
    text(str, 14, true, [88, 28, 200]);
    doc.setDrawColor(220, 215, 240);
    doc.line(MARGIN, y - 4, pageW - MARGIN, y - 4);
    y += 4;
  };

  const r = rec.result;

  // Header band
  doc.setFillColor(88, 28, 200);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ProjectRx AI · Recovery Report", MARGIN, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(rec.input.projectName, MARGIN, 50);
  doc.text(new Date(rec.createdAt).toLocaleString(), pageW - MARGIN, 50, { align: "right" });
  y = 100;

  // Score band
  doc.setFillColor(245, 242, 255);
  doc.roundedRect(MARGIN, y, contentW, 70, 8, 8, "F");
  doc.setTextColor(88, 28, 200);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text(`${r.projectRecoveryIndex}`, MARGIN + 20, y + 46);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 80);
  doc.text("Recovery Index", MARGIN + 20, y + 60);

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 40);
  doc.text(`Status: ${r.status}`, MARGIN + 160, y + 30);
  doc.setFontSize(11);
  doc.text(`Confidence: ${r.confidence}%`, MARGIN + 160, y + 48);
  doc.text(`Risk Level: ${r.riskLevel}`, MARGIN + 160, y + 62);
  y += 90;

  heading("Risk Categories");
  text(r.riskCategories.length ? r.riskCategories.join(", ") : "None flagged.");

  heading("Root Cause Analysis");
  (Array.isArray(r.rootCause) ? r.rootCause : [String(r.rootCause)]).forEach((c, i) => text(`${i + 1}. ${c}`));

  heading("Recommendations");
  r.recommendations.forEach((rec, i) => {
    text(`${i + 1}. ${rec.title}  (Priority: ${rec.priority})`, 11, true);
    text(`Reason: ${rec.reason}`);
    text(`Expected Impact: ${rec.expectedImpact}`);
    y += 4;
  });

  heading("Recovery Checklist");
  r.checklist.forEach((c) => text(`[ ] ${c}`));

  heading("Executive Summary");
  text(r.executiveSummary);

  heading("Stakeholder Email");
  text(`Subject: ${r.stakeholderEmail.subject}`, 10, true);
  text(r.stakeholderEmail.body);

  heading("Lessons Learned");
  r.lessonsLearned.forEach((l) => text(`• ${l}`));

  if (r.assumptions.length) {
    heading("Assumptions");
    r.assumptions.forEach((a) => text(`• ${a}`));
  }
  if (r.missingInformation.length) {
    heading("Missing Information");
    r.missingInformation.forEach((a) => text(`• ${a}`));
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 150);
    doc.text(
      "ProjectRx AI · AI-generated recommendations support — not replace — professional judgment.",
      MARGIN,
      pageH - 20,
    );
    doc.text(`Page ${i} / ${pageCount}`, pageW - MARGIN, pageH - 20, { align: "right" });
  }

  const filename = `${rec.input.projectName.replace(/\s+/g, "_")}_recovery_report.pdf`;
  doc.save(filename);
}
