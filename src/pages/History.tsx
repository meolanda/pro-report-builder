import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Trash2, Eye, Calendar, MapPin, User, Loader2 } from "lucide-react";
import { useReportStorage, SavedReport } from "@/hooks/useReportStorage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const History = () => {
  const navigate = useNavigate();
  const { loadReports, deleteReport, isLoading } = useReportStorage();
  const [reports, setReports] = useState<SavedReport[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const data = await loadReports();
      setReports(data);
    };
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    const success = await deleteReport(id);
    if (success) {
      setReports(reports.filter((r) => r.id !== id));
    }
  };

  const handleLoad = (id: string) => {
    navigate(`/?reportId=${id}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container max-w-5xl py-6 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">ประวัติรายงาน</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">
                รายงานที่บันทึกไว้ทั้งหมด
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-5xl py-8 px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-muted rounded-full mb-4">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">ไม่มีรายงานที่บันทึกไว้</h2>
            <p className="text-muted-foreground mb-6">เริ่มสร้างรายงานใหม่และบันทึกเพื่อดูที่นี่</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              สร้างรายงานใหม่
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="section-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {report.client_name || "Untitled Report"}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {report.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {report.location}
                      </span>
                    )}
                    {report.reporter_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {report.reporter_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLoad(report.id)}
                    className="btn-primary text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>โหลด</span>
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="btn-danger text-sm">
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">ลบ</span>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                          คุณต้องการลบรายงาน "{report.client_name}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(report.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          ลบรายงาน
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
