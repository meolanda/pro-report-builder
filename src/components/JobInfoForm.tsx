import { Upload, Building2, Calendar, MapPin, User } from "lucide-react";
import { JobInfo } from "@/types/report";

interface JobInfoFormProps {
  jobInfo: JobInfo;
  onChange: (jobInfo: JobInfo) => void;
}

const JobInfoForm = ({ jobInfo, onChange }: JobInfoFormProps) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ ...jobInfo, logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="section-card animate-fade-in">
      <h2 className="section-header flex items-center gap-2">
        <Building2 className="w-5 h-5" />
        ข้อมูลงาน (Job Information)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Logo Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            โลโก้บริษัท
          </label>
          <div className="flex items-center gap-4">
            {jobInfo.logo ? (
              <div className="relative">
                <img 
                  src={jobInfo.logo} 
                  alt="Company Logo" 
                  className="h-16 w-auto object-contain border border-border rounded-md p-2 bg-card"
                />
                <button
                  onClick={() => onChange({ ...jobInfo, logo: null })}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:opacity-90 transition-opacity"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="btn-secondary cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>อัปโหลดโลโก้</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
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

export default JobInfoForm;
