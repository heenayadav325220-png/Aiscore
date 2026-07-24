import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { MarketAnalysisReport } from "../types";

/**
 * Generates and downloads a clean, professional PDF document for a Market Analysis Report
 */
export async function downloadMarketAnalysisPDF(report: MarketAnalysisReport, containerId: string): Promise<void> {
  const targetElement = document.getElementById(containerId);
  if (!targetElement) {
    console.error(`Element with id '${containerId}' not found for PDF export.`);
    return;
  }

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 2, // High resolution crisp text
      useCORS: true,
      logging: false,
      backgroundColor: "#0f172a", // Match theme or clean dark PDF canvas
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const sanitizedTitle = (report.ideaTitle || "Market_Analysis")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    pdf.save(`CORE_AI_Market_Analysis_${sanitizedTitle}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    alert("PDF generation encountered an error. Please try again.");
  }
}
