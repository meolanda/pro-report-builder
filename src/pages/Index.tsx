import { useState } from "react";
import { Plus, FileDown, FileText, Loader2 } from "lucide-react";
import JobInfoForm from "@/components/JobInfoForm";
import PhotoSection from "@/components/PhotoSection";
import ConclusionSection from "@/components/ConclusionSection";
import { JobInfo, PhotoSection as PhotoSectionType, ReportData } from "@/types/report";
import { generatePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [jobInfo, setJobInfo] = useState<JobInfo>({
    clientName: "",
    dateTime: "",
    location: "",
    reporterName: "",
    logo: null,
  });

  const [sections, setSections] = useState<PhotoSectionType[]>([
    {
      id: "section-1",
      title: "ก่อนเริ่มงาน",
      photos: [],
    },
  ]);

  const [conclusion, setConclusion] = useState("");

  const addSection = () => {
    const newSection: PhotoSectionType = {
      id: `section-${Date.now()}`,
      title: `หัวข้อใหม่ ${sections.length + 1}`,
      photos: [],
    };
    setSections([...sections, newSection]);
    
    toast({
      title: "เพิ่ม Section สำเร็จ",
      description: "คุณสามารถแก้ไขชื่อ Section ได้โดยกดที่ไอคอนดินสอ",
    });
  };

  const updateSection = (updatedSection: PhotoSectionType) => {
    setSections(
      sections.map((s) => (s.id === updatedSection.id ? updatedSection : s))
    );
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length === 1) {
      toast({
        title: "ไม่สามารถลบได้",
        description: "ต้องมีอย่างน้อย 1 Section ในรายงาน",
        variant: "destructive",
      });
      return;
    }
    setSections(sections.filter((s) => s.id !== sectionId));
    
    toast({
      title: "ลบ Section สำเร็จ",
    });
  };

  const handleGeneratePDF = async () => {
    // Validate
    const totalPhotos = sections.reduce((sum, s) => sum + s.photos.length, 0);
    
    if (totalPhotos === 0) {
      toast({
        title: "ไม่มีรูปภาพ",
        description: "กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const reportData: ReportData = {
        jobInfo,
        sections,
        conclusion,
      };

      await generatePDF(reportData);

      toast({
        title: "สร้าง PDF สำเร็จ",
        description: "ไฟล์รายงานถูกดาวน์โหลดแล้ว",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const totalPhotos = sections.reduce((sum, s) => sum + s.photos.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container max-w-5xl py-8 px-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-xl">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Pro Site Report
              </h1>
              <p className="text-primary-foreground/80 text-sm md:text-base mt-1">
                สร้างรายงานรูปภาพเป็น PDF อย่างมืออาชีพ
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl py-8 px-4">
        <div className="space-y-6">
          {/* Job Information */}
          <JobInfoForm jobInfo={jobInfo} onChange={setJobInfo} />

          {/* Photo Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span>รูปภาพในรายงาน</span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({totalPhotos} รูป)
                </span>
              </h2>
              <button onClick={addSection} className="btn-accent">
                <Plus className="w-4 h-4" />
                <span>เพิ่ม Section</span>
              </button>
            </div>

            {sections.map((section) => (
              <PhotoSection
                key={section.id}
                section={section}
                onUpdate={updateSection}
                onDelete={() => deleteSection(section.id)}
              />
            ))}
          </div>

          {/* Conclusion */}
          <ConclusionSection conclusion={conclusion} onChange={setConclusion} />

          {/* Generate PDF Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="btn-primary text-lg px-8 py-4 shadow-elevated hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  <span>สร้างรายงาน PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container max-w-5xl py-6 px-4">
          <p className="text-center text-sm text-muted-foreground">
            Pro Site Report © {new Date().getFullYear()} — สร้างรายงานรูปภาพระดับมืออาชีพ
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
