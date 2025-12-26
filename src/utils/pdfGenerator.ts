import jsPDF from "jspdf";
import { ReportData } from "@/types/report";

// A4 dimensions in mm
const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = A4_WIDTH - MARGIN * 2;
const HEADER_HEIGHT = 25;
const FOOTER_HEIGHT = 15;

// Image settings
const IMAGES_PER_ROW = 2;
const IMAGE_GAP = 8;
const IMAGE_WIDTH = (CONTENT_WIDTH - IMAGE_GAP) / 2;
const IMAGE_ASPECT_RATIO = 0.75; // 4:3 aspect ratio
const IMAGE_HEIGHT = IMAGE_WIDTH * IMAGE_ASPECT_RATIO;
const CAPTION_LINE_HEIGHT = 5;
const MAX_CAPTION_LINES = 2;

// Navy color
const NAVY = { r: 30, g: 58, b: 95 };

const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const drawHeader = (
  pdf: jsPDF,
  data: ReportData,
  pageNumber: number,
  totalPages: number
) => {
  const y = MARGIN;

  // Draw header background
  pdf.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  pdf.rect(0, 0, A4_WIDTH, HEADER_HEIGHT + 5, "F");

  // Logo (left side)
  if (data.jobInfo.logo) {
    try {
      pdf.addImage(data.jobInfo.logo, "PNG", MARGIN, 5, 20, 20);
    } catch (e) {
      console.error("Failed to add logo:", e);
    }
  }

  // Job info (right side)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);

  const rightX = A4_WIDTH - MARGIN;
  let infoY = 8;

  if (data.jobInfo.clientName) {
    pdf.text(`ลูกค้า: ${data.jobInfo.clientName}`, rightX, infoY, { align: "right" });
    infoY += 5;
  }
  if (data.jobInfo.location) {
    pdf.text(`สถานที่: ${data.jobInfo.location}`, rightX, infoY, { align: "right" });
    infoY += 5;
  }
  if (data.jobInfo.dateTime) {
    pdf.text(`วันที่: ${formatDate(data.jobInfo.dateTime)}`, rightX, infoY, { align: "right" });
  }

  // Reset text color
  pdf.setTextColor(0, 0, 0);
};

const drawFooter = (
  pdf: jsPDF,
  reporterName: string,
  pageNumber: number,
  totalPages: number
) => {
  const y = A4_HEIGHT - MARGIN + 5;

  // Footer line
  pdf.setDrawColor(NAVY.r, NAVY.g, NAVY.b);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y - 5, A4_WIDTH - MARGIN, y - 5);

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);

  // Reporter name (left)
  if (reporterName) {
    pdf.text(`ผู้รายงาน: ${reporterName}`, MARGIN, y);
  }

  // Page number (right)
  pdf.text(`หน้า ${pageNumber} / ${totalPages}`, A4_WIDTH - MARGIN, y, { align: "right" });

  // Reset text color
  pdf.setTextColor(0, 0, 0);
};

const wrapText = (pdf: jsPDF, text: string, maxWidth: number): string[] => {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = pdf.getTextWidth(testLine);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, MAX_CAPTION_LINES);
};

export const generatePDF = async (data: ReportData): Promise<void> => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Use default font for Thai support
  pdf.setFont("Helvetica");

  let currentPage = 1;
  let currentY = HEADER_HEIGHT + MARGIN + 5;
  const contentEndY = A4_HEIGHT - FOOTER_HEIGHT - MARGIN;

  // Prepare all pages first to get total count
  interface PageContent {
    type: "section-title" | "image-row" | "conclusion";
    data: unknown;
  }

  const pages: PageContent[][] = [[]];
  let currentPageContent = pages[0];

  const addNewPage = () => {
    pages.push([]);
    currentPageContent = pages[pages.length - 1];
    currentY = HEADER_HEIGHT + MARGIN + 5;
  };

  const checkAndAddNewPage = (neededHeight: number) => {
    if (currentY + neededHeight > contentEndY) {
      addNewPage();
    }
  };

  // Process sections
  for (const section of data.sections) {
    // Section title
    const titleHeight = 12;
    checkAndAddNewPage(titleHeight);
    currentPageContent.push({ type: "section-title", data: section.title });
    currentY += titleHeight;

    // Process photos in pairs
    for (let i = 0; i < section.photos.length; i += IMAGES_PER_ROW) {
      const rowPhotos = section.photos.slice(i, i + IMAGES_PER_ROW);
      
      // Calculate row height (image + caption space if any)
      let maxCaptionHeight = 0;
      for (const photo of rowPhotos) {
        if (photo.caption) {
          pdf.setFontSize(8);
          const captionLines = wrapText(pdf, photo.caption, IMAGE_WIDTH - 4);
          const captionHeight = captionLines.length * CAPTION_LINE_HEIGHT + 3;
          maxCaptionHeight = Math.max(maxCaptionHeight, captionHeight);
        }
      }

      const rowHeight = IMAGE_HEIGHT + maxCaptionHeight + 8;
      checkAndAddNewPage(rowHeight);

      currentPageContent.push({
        type: "image-row",
        data: { photos: rowPhotos, y: currentY },
      });
      currentY += rowHeight;
    }

    currentY += 5; // Space between sections
  }

  // Conclusion
  if (data.conclusion) {
    checkAndAddNewPage(40);
    currentPageContent.push({ type: "conclusion", data: data.conclusion });
  }

  // Now render all pages
  const totalPages = pages.length;

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    currentPage = pageIndex + 1;
    currentY = HEADER_HEIGHT + MARGIN + 5;

    // Draw header and footer
    drawHeader(pdf, data, currentPage, totalPages);
    drawFooter(pdf, data.jobInfo.reporterName, currentPage, totalPages);

    // Render page content
    for (const content of pages[pageIndex]) {
      if (content.type === "section-title") {
        // Section title
        pdf.setFontSize(12);
        pdf.setTextColor(NAVY.r, NAVY.g, NAVY.b);
        pdf.setFont("Helvetica", "bold");
        pdf.text(content.data as string, MARGIN, currentY);
        pdf.setFont("Helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        
        // Underline
        pdf.setDrawColor(NAVY.r, NAVY.g, NAVY.b);
        pdf.setLineWidth(0.3);
        pdf.line(MARGIN, currentY + 1.5, MARGIN + pdf.getTextWidth(content.data as string), currentY + 1.5);
        
        currentY += 12;
      } else if (content.type === "image-row") {
        const { photos } = content.data as { photos: { id: string; preview: string; caption: string }[]; y: number };

        // Draw images
        for (let j = 0; j < photos.length; j++) {
          const photo = photos[j];
          const x = MARGIN + j * (IMAGE_WIDTH + IMAGE_GAP);

          try {
            // Draw border first
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.3);
            pdf.rect(x, currentY, IMAGE_WIDTH, IMAGE_HEIGHT);

            // Add image
            pdf.addImage(
              photo.preview,
              "JPEG",
              x + 0.5,
              currentY + 0.5,
              IMAGE_WIDTH - 1,
              IMAGE_HEIGHT - 1
            );

            // Add caption if exists
            if (photo.caption) {
              pdf.setFontSize(8);
              pdf.setTextColor(60, 60, 60);
              const captionLines = wrapText(pdf, photo.caption, IMAGE_WIDTH - 4);
              let captionY = currentY + IMAGE_HEIGHT + 4;
              for (const line of captionLines) {
                pdf.text(line, x + 2, captionY);
                captionY += CAPTION_LINE_HEIGHT;
              }
              pdf.setTextColor(0, 0, 0);
            }
          } catch (e) {
            console.error("Failed to add image:", e);
          }
        }

        // Calculate max caption height for this row
        let maxCaptionHeight = 0;
        for (const photo of photos) {
          if (photo.caption) {
            pdf.setFontSize(8);
            const captionLines = wrapText(pdf, photo.caption, IMAGE_WIDTH - 4);
            const captionHeight = captionLines.length * CAPTION_LINE_HEIGHT + 3;
            maxCaptionHeight = Math.max(maxCaptionHeight, captionHeight);
          }
        }

        currentY += IMAGE_HEIGHT + maxCaptionHeight + 8;
      } else if (content.type === "conclusion") {
        // Conclusion section
        pdf.setFontSize(12);
        pdf.setTextColor(NAVY.r, NAVY.g, NAVY.b);
        pdf.setFont("Helvetica", "bold");
        pdf.text("สรุปผลการทำงาน", MARGIN, currentY);
        pdf.setFont("Helvetica", "normal");
        
        // Underline
        pdf.setDrawColor(NAVY.r, NAVY.g, NAVY.b);
        pdf.setLineWidth(0.3);
        pdf.line(MARGIN, currentY + 1.5, MARGIN + pdf.getTextWidth("สรุปผลการทำงาน"), currentY + 1.5);
        
        currentY += 10;

        // Conclusion text
        pdf.setFontSize(10);
        pdf.setTextColor(40, 40, 40);
        const conclusionLines = pdf.splitTextToSize(content.data as string, CONTENT_WIDTH);
        pdf.text(conclusionLines, MARGIN, currentY);
      }
    }
  }

  // Save PDF
  const fileName = data.jobInfo.clientName
    ? `รายงาน_${data.jobInfo.clientName}_${new Date().toISOString().split("T")[0]}.pdf`
    : `รายงาน_${new Date().toISOString().split("T")[0]}.pdf`;

  pdf.save(fileName);
};
