import { memo } from "react";
import { Building2, Calendar, MapPin, User, FileText } from "lucide-react";
import { JobInfo } from "@/types/report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobInfoFormProps {
  jobInfo: JobInfo;
  onChange: (jobInfo: JobInfo) => void;
}

const SUBJECT_OPTIONS = [
  { value: "รายงานเสนอซ่อม", label: "รายงานเสนอซ่อม" },
  { value: "รายงานการทำงาน", label: "รายงานการทำงาน" },
];

const JobInfoForm = ({ jobInfo, onChange }: JobInfoFormProps) => {
  return (
    <div className="section-card animate-fade-in">
      <h2 className="section-header flex items-center gap-2">
        <Building2 className="w-5 h-5" />
        ข้อมูลงาน (Job Information)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Subject - Dropdown */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              เรื่อง
            </span>
          </label>
          <Select
            value={jobInfo.subject}
            onValueChange={(value) => onChange({ ...jobInfo, subject: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกหัวข้อเรื่อง" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              ชื่อลูกค้า
            </span>
          </label>
          <input
            type="text"
            value={jobInfo.clientName}
            onChange={(e) => onChange({ ...jobInfo, clientName: e.target.value })}
            placeholder="กรอกชื่อลูกค้า"
            className="input-field"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              วันที่
            </span>
          </label>
          <input
            type="date"
            value={jobInfo.dateTime}
            onChange={(e) => onChange({ ...jobInfo, dateTime: e.target.value })}
            className="input-field"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              สถานที่
            </span>
          </label>
          <input
            type="text"
            value={jobInfo.location}
            onChange={(e) => onChange({ ...jobInfo, location: e.target.value })}
            placeholder="กรอกสถานที่ปฏิบัติงาน"
            className="input-field"
          />
        </div>

        {/* Reporter Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              ชื่อผู้รายงาน
            </span>
          </label>
          <input
            type="text"
            value={jobInfo.reporterName}
            onChange={(e) => onChange({ ...jobInfo, reporterName: e.target.value })}
            placeholder="กรอกชื่อผู้รายงาน"
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default memo(JobInfoForm);
