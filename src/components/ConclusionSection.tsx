import { FileText } from "lucide-react";

interface ConclusionSectionProps {
  conclusion: string;
  onChange: (conclusion: string) => void;
}

const ConclusionSection = ({ conclusion, onChange }: ConclusionSectionProps) => {
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
      </div>
    </>
  );
};

export default ConclusionSection;
