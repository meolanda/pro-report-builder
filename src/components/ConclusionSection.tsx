import { FileText } from "lucide-react";

interface ConclusionSectionProps {
  conclusion: string;
  onChange: (conclusion: string) => void;
}

const ConclusionSection = ({ conclusion, onChange }: ConclusionSectionProps) => {
  return (
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
  );
};

export default ConclusionSection;
