import jsPDF from "jspdf";
import { ReportData } from "@/types/report";
import pdfHeaderImage from "@/assets/pdf-header.jpg";

// A4 dimensions in mm
const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = A4_WIDTH - MARGIN * 2;
const FIXED_HEADER_HEIGHT = 25; // Height for fixed header image
const HEADER_HEIGHT = FIXED_HEADER_HEIGHT + 18; // Total header area including job info
const FOOTER_HEIGHT = 12;

// Image settings - optimized for 6 images per page (2 cols x 3 rows)
const IMAGES_PER_ROW = 2;
const IMAGE_GAP = 6;
const IMAGE_WIDTH = (CONTENT_WIDTH - IMAGE_GAP) / 2;
const IMAGE_ASPECT_RATIO = 0.7; // Slightly shorter for more images per page
const IMAGE_HEIGHT = IMAGE_WIDTH * IMAGE_ASPECT_RATIO;
const CAPTION_LINE_HEIGHT = 4;
const MAX_CAPTION_LINES = 2;
const ROW_GAP = 4; // Reduced gap between rows

// Navy color
const NAVY = { r: 30, g: 58, b: 95 };

// Dynamic Thai font loading (Sarabun) to avoid broken hardcoded Base64 strings.
// We fetch a TTF at runtime, convert to Base64, then register it in jsPDF's VFS.
const SARABUN_TTF_URL =
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/sarabun/Sarabun-Regular.ttf";

let sarabunTtfBase64Cache: string | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
};

const loadSarabunBase64 = async (): Promise<string> => {
  if (sarabunTtfBase64Cache) return sarabunTtfBase64Cache;

  const res = await fetch(SARABUN_TTF_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch Sarabun font: ${res.status} ${res.statusText}`
    );
  }

  const buffer = await res.arrayBuffer();
  sarabunTtfBase64Cache = arrayBufferToBase64(buffer);
  return sarabunTtfBase64Cache;
};

const ensureThaiFont = async (pdf: jsPDF) => {
  const base64 = await loadSarabunBase64();
  pdf.addFileToVFS("Sarabun-Regular.ttf", base64);
  pdf.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  pdf.setFont("Sarabun", "normal");
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Convert image URL to Base64 to bypass CORS
const imageToBase64 = async (imageUrl: string): Promise<string> => {
  // If already a data URL, return as is
  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    // Return original URL as fallback
    return imageUrl;
  }
};

// Preload all images and convert to Base64
const preloadImages = async (data: ReportData): Promise<ReportData> => {
  const convertedData = { ...data };

  // Convert all section photos
  convertedData.sections = await Promise.all(
    data.sections.map(async (section) => ({
      ...section,
      photos: await Promise.all(
        section.photos.map(async (photo) => ({
          ...photo,
          preview: await imageToBase64(photo.preview),
        }))
      ),
    }))
  );

  return convertedData;
};

// Cache for fixed header image Base64
let fixedHeaderBase64Cache: string | null = null;

const loadFixedHeaderImage = async (): Promise<string> => {
  if (fixedHeaderBase64Cache) return fixedHeaderBase64Cache;
  fixedHeaderBase64Cache = await imageToBase64(pdfHeaderImage);
  return fixedHeaderBase64Cache;
};

const drawHeader = async (
  pdf: jsPDF,
  data: ReportData,
  pageNumber: number,
  totalPages: number
) => {
  // Draw fixed header image (full width)
  try {
    const headerBase64 = await loadFixedHeaderImage();
    // Full width header image at top of page
    pdf.addImage(headerBase64, "JPEG", 0, 0, A4_WIDTH, FIXED_HEADER_HEIGHT);
  } catch (e) {
    console.error("Failed to add header image:", e);
    // Fallback: draw navy background
    pdf.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    pdf.rect(0, 0, A4_WIDTH, FIXED_HEADER_HEIGHT, "F");
  }

  // Draw job info bar below header image
  const infoBarY = FIXED_HEADER_HEIGHT;
  const infoBarHeight = 18;
  pdf.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  pdf.rect(0, infoBarY, A4_WIDTH, infoBarHeight, "F");

  // Job info text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);

  const leftX = MARGIN;
  const rightX = A4_WIDTH - MARGIN;
  let infoY = infoBarY + 6;

  // Left side - client name
  if (data.jobInfo.clientName) {
    pdf.text(`ลูกค้า: ${data.jobInfo.clientName}`, leftX, infoY);
  }
  
  // Right side - date
  if (data.jobInfo.dateTime) {
    pdf.text(`วันที่: ${formatDate(data.jobInfo.dateTime)}`, rightX, infoY, {
      align: "right",
    });
  }

  infoY += 6;

  // Left side - location
  if (data.jobInfo.location) {
    pdf.text(`สถานที่: ${data.jobInfo.location}`, leftX, infoY);
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
  pdf.text(`หน้า ${pageNumber} / ${totalPages}`, A4_WIDTH - MARGIN, y, {
    align: "right",
  });

  // Reset text color
  pdf.setTextColor(0, 0, 0);
};

const wrapText = (pdf: jsPDF, text: string, maxWidth: number): string[] => {
  if (!text) return [];

  // Thai-friendly wrapping: wrap by characters (Thai often has no spaces)
  const chars = text.split("");
  const lines: string[] = [];
  let currentLine = "";

  for (const char of chars) {
    const testLine = currentLine + char;
    const testWidth = pdf.getTextWidth(testLine);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, MAX_CAPTION_LINES);
};

export const generatePDF = async (data: ReportData): Promise<Blob> => {
  // Preload and convert all images to Base64 to bypass CORS
  console.log("Preloading images...");
  const convertedData = await preloadImages(data);
  console.log("Images preloaded successfully");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Load Sarabun dynamically for Thai text support
  try {
    await ensureThaiFont(pdf);
  } catch (error) {
    console.error("Failed to load Sarabun font, using fallback:", error);
    pdf.setFont("Helvetica");
  }

  let currentY = HEADER_HEIGHT + MARGIN;
  const contentEndY = A4_HEIGHT - FOOTER_HEIGHT - MARGIN + 5;

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
    currentY = HEADER_HEIGHT + MARGIN;
  };

  const checkAndAddNewPage = (neededHeight: number) => {
    if (currentY + neededHeight > contentEndY) {
      addNewPage();
    }
  };

  // Process sections - ONE SECTION PER PAGE rule
  for (let sectionIndex = 0; sectionIndex < convertedData.sections.length; sectionIndex++) {
    const section = convertedData.sections[sectionIndex];
    
    // Force new page for each section (except first section on first page)
    if (sectionIndex > 0 || currentPageContent.length > 0) {
      addNewPage();
    }

    // Section title
    const titleHeight = 10;
    currentPageContent.push({ type: "section-title", data: section.title });
    currentY += titleHeight;

    // Process photos in pairs
    for (let i = 0; i < section.photos.length; i += IMAGES_PER_ROW) {
      const rowPhotos = section.photos.slice(i, i + IMAGES_PER_ROW);
      
      // Calculate row height (image + caption space if any has caption)
      let maxCaptionHeight = 0;
      for (const photo of rowPhotos) {
        if (photo.caption && photo.caption.trim()) {
          pdf.setFontSize(8);
          const captionLines = wrapText(pdf, photo.caption, IMAGE_WIDTH - 4);
          const captionHeight = captionLines.length * CAPTION_LINE_HEIGHT + 2;
          maxCaptionHeight = Math.max(maxCaptionHeight, captionHeight);
        }
      }

      const rowHeight = IMAGE_HEIGHT + maxCaptionHeight + ROW_GAP;
      
      // Check if row fits, if not add new page (continue same section)
      if (currentY + rowHeight > contentEndY) {
        addNewPage();
        // Re-add section title on continued page
        currentPageContent.push({ type: "section-title", data: `${section.title} (ต่อ)` });
        currentY += titleHeight;
      }

      currentPageContent.push({
        type: "image-row",
        data: { photos: rowPhotos, y: currentY },
      });
      currentY += rowHeight;
    }
  }

  // Conclusion - บังคับขึ้นหน้าใหม่เสมอ
  if (convertedData.conclusion && convertedData.conclusion.trim()) {
    addNewPage(); // Force new page for conclusion
    currentPageContent.push({ type: "conclusion", data: convertedData.conclusion });
  }

  // Now render all pages
  const totalPages = pages.length;

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    const currentPage = pageIndex + 1;
    currentY = HEADER_HEIGHT + MARGIN;

    // Ensure Thai font is active on each page (jsPDF state may reset after addPage)
    try {
      pdf.setFont("Sarabun", "normal");
    } catch {
      pdf.setFont("Helvetica");
    }

    // Draw header and footer
    await drawHeader(pdf, convertedData, currentPage, totalPages);
    drawFooter(pdf, convertedData.jobInfo.reporterName, currentPage, totalPages);

    // Render page content
    for (const content of pages[pageIndex]) {
      if (content.type === "section-title") {
        // Section title
        pdf.setFontSize(12);
        pdf.setTextColor(NAVY.r, NAVY.g, NAVY.b);
        pdf.text(content.data as string, MARGIN, currentY);
        
        // Underline
        pdf.setDrawColor(NAVY.r, NAVY.g, NAVY.b);
        pdf.setLineWidth(0.3);
        const textWidth = pdf.getTextWidth(content.data as string);
        pdf.line(MARGIN, currentY + 1, MARGIN + textWidth, currentY + 1);
        
        currentY += 10;
      } else if (content.type === "image-row") {
        const { photos } = content.data as { photos: { id: string; preview: string; caption: string }[]; y: number };

        // Draw images - top aligned
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

            // Add caption ONLY if exists and not empty
            if (photo.caption && photo.caption.trim()) {
              pdf.setFontSize(8);
              pdf.setTextColor(60, 60, 60);
              const captionLines = wrapText(pdf, photo.caption, IMAGE_WIDTH - 4);
              let captionY = currentY + IMAGE_HEIGHT + 3;
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

        // Calculate max caption height for this row (only if any photo has caption)
        let maxCaptionHeight = 0;
        for (const photo of photos) {
          if (photo.caption && photo.caption.trim()) {
            pdf.setFontSize(8);
            const captionLines = wrapText(pdf, photo.caption, IMAGE_WIDTH - 4);
            const captionHeight = captionLines.length * CAPTION_LINE_HEIGHT + 2;
            maxCaptionHeight = Math.max(maxCaptionHeight, captionHeight);
          }
        }

        currentY += IMAGE_HEIGHT + maxCaptionHeight + ROW_GAP;
      } else if (content.type === "conclusion") {
        // Conclusion section
        const conclusionTitle = "สรุปผลการทำงาน";

        pdf.setFontSize(12);
        pdf.setTextColor(NAVY.r, NAVY.g, NAVY.b);
        pdf.text(conclusionTitle, MARGIN, currentY);

        // Underline
        pdf.setDrawColor(NAVY.r, NAVY.g, NAVY.b);
        pdf.setLineWidth(0.3);
        const titleWidth = pdf.getTextWidth(conclusionTitle);
        pdf.line(MARGIN, currentY + 1.5, MARGIN + titleWidth, currentY + 1.5);

        currentY += 10;

        // Conclusion text
        pdf.setFontSize(10);
        pdf.setTextColor(40, 40, 40);
        const conclusionLines = pdf.splitTextToSize(content.data as string, CONTENT_WIDTH);
        for (const line of conclusionLines) {
          pdf.text(line, MARGIN, currentY);
          currentY += 5;
        }

        // Contact footer box
        currentY += 15;
        
        // Draw contact box
        const boxY = currentY;
        const boxHeight = 25;
        pdf.setFillColor(248, 248, 248);
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(MARGIN, boxY, CONTENT_WIDTH, boxHeight, 3, 3, "FD");

        // Contact text from footerNote
        pdf.setFontSize(9);
        pdf.setTextColor(120, 120, 120);
        const footerText = data.jobInfo.footerNote || "ขอบคุณที่ไว้วางใจใช้บริการ";
        const footerLines = footerText.split("\n");
        
        const textCenterX = A4_WIDTH / 2;
        let footerY = boxY + 9;
        for (const line of footerLines) {
          pdf.text(line.trim(), textCenterX, footerY, { align: "center" });
          footerY += 8;
        }
        
        currentY += boxHeight + 5;
      }
    }
  }

  // Return blob
  return pdf.output("blob");
};

export const downloadPDF = async (data: ReportData): Promise<void> => {
  try {
    const blob = await generatePDF(data);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const fileName = data.jobInfo.clientName
      ? `รายงาน_${data.jobInfo.clientName}_${new Date().toISOString().split("T")[0]}.pdf`
      : `รายงาน_${new Date().toISOString().split("T")[0]}.pdf`;
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
