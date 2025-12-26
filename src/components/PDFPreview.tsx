import { X } from "lucide-react";
import { ReportData } from "@/types/report";

interface PDFPreviewProps {
  data: ReportData;
  onClose: () => void;
}

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

const PDFPreview = ({ data, onClose }: PDFPreviewProps) => {
  // Split photos into rows of 2
  const getPhotoRows = (photos: typeof data.sections[0]["photos"]) => {
    const rows = [];
    for (let i = 0; i < photos.length; i += 2) {
      rows.push(photos.slice(i, i + 2));
    }
    return rows;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background rounded-lg shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-card hover:bg-muted rounded-full shadow-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Preview header */}
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <h2 className="text-lg font-semibold">Preview รายงาน PDF</h2>
          <p className="text-sm text-primary-foreground/80">ตัวอย่างก่อนดาวน์โหลด (A4 Format)</p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 bg-muted/50">
          {/* A4 Page simulation */}
          <div 
            className="bg-white shadow-xl mx-auto"
            style={{ 
              width: "210mm", 
              maxWidth: "100%",
              minHeight: "297mm",
              transform: "scale(0.6)",
              transformOrigin: "top center",
              marginBottom: "-40%"
            }}
          >
            {/* Header */}
            <div className="bg-[#1E3A5F] text-white px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {data.jobInfo.logo ? (
                  <img 
                    src={data.jobInfo.logo} 
                    alt="Company Logo" 
                    className="w-16 h-16 object-contain bg-white rounded p-1"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/20 rounded flex items-center justify-center text-xs">
                    Logo
                  </div>
                )}
              </div>
              <div className="text-right text-sm">
                {data.jobInfo.clientName && (
                  <p>ลูกค้า: {data.jobInfo.clientName}</p>
                )}
                {data.jobInfo.location && (
                  <p>สถานที่: {data.jobInfo.location}</p>
                )}
                {data.jobInfo.dateTime && (
                  <p>วันที่: {formatDate(data.jobInfo.dateTime)}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              {data.sections.map((section) => (
                <div key={section.id} className="mb-8">
                  {/* Section title */}
                  <h3 className="text-lg font-semibold text-[#1E3A5F] border-b-2 border-[#1E3A5F] pb-1 mb-4">
                    {section.title}
                  </h3>

                  {/* Photos grid - 2 columns */}
                  {section.photos.length > 0 ? (
                    <div className="space-y-4">
                      {getPhotoRows(section.photos).map((row, rowIndex) => (
                        <div 
                          key={rowIndex} 
                          className="grid grid-cols-2 gap-4 items-start"
                        >
                          {row.map((photo) => (
                            <div key={photo.id} className="flex flex-col">
                              <div className="border border-gray-300 rounded overflow-hidden">
                                <img
                                  src={photo.preview}
                                  alt=""
                                  className="w-full aspect-[4/3] object-cover"
                                />
                              </div>
                              {/* Caption - only show if exists */}
                              {photo.caption && photo.caption.trim() && (
                                <p className="text-xs text-gray-600 mt-2 px-1 line-clamp-2">
                                  {photo.caption}
                                </p>
                              )}
                            </div>
                          ))}
                          {/* Fill empty slot if odd number */}
                          {row.length === 1 && <div />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">ไม่มีรูปภาพ</p>
                  )}
                </div>
              ))}

              {/* Conclusion */}
              {data.conclusion && data.conclusion.trim() && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-[#1E3A5F] border-b-2 border-[#1E3A5F] pb-1 mb-4">
                    สรุปผลการทำงาน
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {data.conclusion}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-gray-300 flex justify-between text-xs text-gray-500 mt-auto">
              <span>ผู้รายงาน: {data.jobInfo.reporterName || "-"}</span>
              <span>หน้า 1 / 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
