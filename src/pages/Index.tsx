import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, FileDown, FileText, Loader2, Eye, Save, History } from "lucide-react";
import JobInfoForm from "@/components/JobInfoForm";
import PhotoSection from "@/components/PhotoSection";
import ConclusionSection from "@/components/ConclusionSection";
import PDFPreview from "@/components/PDFPreview";
import { JobInfo, PhotoSection as PhotoSectionType, ReportData } from "@/types/report";
import { downloadPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { useReportStorage } from "@/hooks/useReportStorage";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveReport, loadReport, isSaving, isLoading } = useReportStorage();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [jobInfo, setJobInfo] = useState<JobInfo>({
    clientName: "",
    dateTime: "",
    location: "",
    reporterName: "",
    logo: null,
    footerNote: "ขอบคุณที่ไว้วางใจใช้บริการ\nหากพบปัญหาการใช้งาน กรุณาติดต่อ...",
    subject: "",
  });

  const [sections, setSections] = useState<PhotoSectionType[]>([
    {
      id: "section-1",
      title: "1. สภาพหน้างานก่อนเริ่มงาน",
      photos: [],
    },
    {
      id: "section-2",
      title: "2. ภาพขณะปฏิบัติงาน",
      photos: [],
    },
    {
      id: "section-3",
      title: "3. ผลงานหลังทำเสร็จ / ส่งมอบงาน",
      photos: [],
    },
  ]);

  const [conclusion, setConclusion] = useState("");

  // Load report if reportId is in URL
  useEffect(() => {
    const reportId = searchParams.get("reportId");
    if (reportId) {
      const loadData = async () => {
        const data = await loadReport(reportId);
        if (data) {
          setJobInfo(data.jobInfo);
          setSections(data.sections.length > 0 ? data.sections : [
            { id: "section-1", title: "1. สภาพหน้างานก่อนเริ่มงาน", photos: [] },
            { id: "section-2", title: "2. ภาพขณะปฏิบัติงาน", photos: [] },
            { id: "section-3", title: "3. ผลงานหลังทำเสร็จ / ส่งมอบงาน", photos: [] },
          ]);
          setConclusion(data.conclusion);
          toast({
            title: "โหลดรายงานสำเร็จ",
            description: "ข้อมูลรายงานถูกโหลดแล้ว",
          });
        }
      };
      loadData();
    }
  }, [searchParams]);

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

      await downloadPDF(reportData);

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

  const handleSaveReport = async () => {
    await saveReport(jobInfo, sections, conclusion);
  };

  const handlePreview = () => {
    const totalPhotos = sections.reduce((sum, s) => sum + s.photos.length, 0);

    if (totalPhotos === 0 && !conclusion && !jobInfo.clientName) {
      toast({
        title: "ไม่มีข้อมูล",
        description: "กรุณากรอกข้อมูลหรืออัปโหลดรูปภาพก่อน Preview",
        variant: "destructive",
      });
      return;
    }

    setShowPreview(true);
  };

  const totalPhotos = sections.reduce((sum, s) => sum + s.photos.length, 0);

  const reportData: ReportData = {
    jobInfo,
    sections,
    conclusion,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container max-w-5xl py-8 px-4">
          <div className="flex items-center justify-between">
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

            {/* History button */}
            <button
              onClick={() => navigate("/history")}
              className="btn-secondary"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">ประวัติ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl py-8 px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">กำลังโหลดรายงาน...</p>
          </div>
        ) : (
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

              {/* --- แทรกกล่องหลอกระบบ (White Text Spacer) --- */}
              <div
                aria-hidden="true"
                style={{
                  height: "120px",
                  width: "100%",
                  // “White Text Spacer”: มีตัวอักษรจองที่ แต่เป็นสีขาว (มักไม่ถูก PDF ตัดทิ้ง)
                  color: "hsl(0 0% 100%)",
                  fontSize: "1px",
                  lineHeight: "1px",
                  userSelect: "none",
                }}
              >
                .
              </div>
            </div>

            {/* Conclusion */}
            <ConclusionSection 
              conclusion={conclusion} 
              onChange={setConclusion}
              footerNote={jobInfo.footerNote}
              onFooterNoteChange={(note) => setJobInfo({ ...jobInfo, footerNote: note })}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {/* Preview Button */}
              <button
                onClick={handlePreview}
                className="btn-outline text-lg px-6 py-3"
              >
                <Eye className="w-5 h-5" />
                <span>Preview</span>
              </button>

              {/* Save Button */}
              <button
                onClick={handleSaveReport}
                disabled={isSaving}
                className="btn-secondary text-lg px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>บันทึก</span>
                  </>
                )}
              </button>

              {/* Generate PDF Button */}
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container max-w-5xl py-6 px-4">
          <p className="text-center text-sm text-muted-foreground">
            Pro Site Report © {new Date().getFullYear()} — สร้างรายงานรูปภาพระดับมืออาชีพ
          </p>
        </div>
      </footer>

      {/* PDF Preview Modal */}
      {showPreview && (
        <PDFPreview data={reportData} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};

export default Index;
