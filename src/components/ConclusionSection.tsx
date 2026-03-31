import { FileText, MessageSquare } from "lucide-react";

interface ConclusionSectionProps {
  conclusion: string;
  onChange: (conclusion: string) => void;
  footerNote: string;
  onFooterNoteChange: (footerNote: string) => void;
}

const ConclusionSection = ({ 
  conclusion, 
  onChange, 
  footerNote, 
  onFooterNoteChange 
}: ConclusionSectionProps) => {
  return (
    <>
      {/* ดันด้วย br แบบบ้านๆ แต่ได้ผลชัวร์ */}
      <br />
      <br />
      <br />

      <div
        className="w-full clear-both break-inside-avoid print:break-inside-avoid"
        style={{
          marginTop: "50px",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "30px",
          width: "100%",
          pageBreakInside: "avoid",
        }}
      >
        <div className="section-card animate-fade-in">
          <h2 className="section-header flex items-center gap-2">
            <FileText className="w-5 h-5" />
            สรุปผลการทำงาน (Conclusion)
          </h2>

          <textarea
            value={conclusion}
            onChange={(e) => onChange(e.target.value)}
            placeholder="พิมพ์สรุปผลการทำงานที่นี่..."
            rows={6}
            className="input-field resize-y min-h-[150px]"
          />
        </div>

        {/* Footer Note */}
        <div className="section-card animate-fade-in mt-4">
          <h2 className="section-header flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            ข้อความท้ายกระดาษ (Footer Note)
          </h2>

          <textarea
            value={footerNote}
            onChange={(e) => onFooterNoteChange(e.target.value)}
            placeholder="ข้อความที่จะแสดงในกรอบท้าย PDF..."
            rows={3}
            className="input-field resize-y min-h-[80px] text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground mt-2">
            * ข้อความนี้จะแสดงในกรอบสีเทาท้ายหน้าสรุปผลใน PDF
          </p>
        </div>
      </div>
    </>
  );
};

export default ConclusionSection;
