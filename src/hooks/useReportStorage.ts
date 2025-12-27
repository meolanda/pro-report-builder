import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobInfo, PhotoSection, ReportData } from "@/types/report";
import { useToast } from "@/hooks/use-toast";

export interface SavedReport {
  id: string;
  client_name: string;
  date_time: string | null;
  location: string | null;
  reporter_name: string | null;
  logo_url: string | null;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
}

export const useReportStorage = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const uploadImage = async (file: File | string, path: string): Promise<string | null> => {
    try {
      // If it's already a URL or base64, handle accordingly
      if (typeof file === "string") {
        // If it's a data URL (base64), convert to blob and upload
        if (file.startsWith("data:")) {
          const response = await fetch(file);
          const blob = await response.blob();
          const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
          
          const { data, error } = await supabase.storage
            .from("report-images")
            .upload(fileName, blob, { contentType: "image/jpeg" });

          if (error) throw error;
          
          const { data: urlData } = supabase.storage
            .from("report-images")
            .getPublicUrl(data.path);
          
          return urlData.publicUrl;
        }
        // If it's already a URL, return as is
        return file;
      }

      // Upload file
      const fileName = `${path}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("report-images")
        .upload(fileName, file, { contentType: file.type });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("report-images")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const saveReport = async (
    jobInfo: JobInfo,
    sections: PhotoSection[],
    conclusion: string
  ): Promise<string | null> => {
    setIsSaving(true);

    try {
      // Upload logo if exists
      let logoUrl = null;
      if (jobInfo.logo) {
        logoUrl = await uploadImage(jobInfo.logo, "logos");
      }

      // Create report
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .insert({
          client_name: jobInfo.clientName || "Untitled Report",
          date_time: jobInfo.dateTime || null,
          location: jobInfo.location || null,
          reporter_name: jobInfo.reporterName || null,
          logo_url: logoUrl,
          conclusion: conclusion || null,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Save sections and images
      for (let sIndex = 0; sIndex < sections.length; sIndex++) {
        const section = sections[sIndex];

        const { data: savedSection, error: sectionError } = await supabase
          .from("report_sections")
          .insert({
            report_id: report.id,
            title: section.title,
            order_index: sIndex,
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Upload and save images
        for (let iIndex = 0; iIndex < section.photos.length; iIndex++) {
          const photo = section.photos[iIndex];
          const imageUrl = await uploadImage(photo.preview, `reports/${report.id}`);

          if (imageUrl) {
            const { error: imageError } = await supabase
              .from("report_images")
              .insert({
                section_id: savedSection.id,
                image_url: imageUrl,
                caption: photo.caption || null,
                order_index: iIndex,
              });

            if (imageError) throw imageError;
          }
        }
      }

      toast({
        title: "บันทึกสำเร็จ",
        description: "รายงานถูกบันทึกลงฐานข้อมูลแล้ว",
      });

      return report.id;
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกรายงานได้",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const loadReports = async (): Promise<SavedReport[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading reports:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายงานได้",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const loadReport = async (reportId: string): Promise<ReportData | null> => {
    setIsLoading(true);
    try {
      // Load report
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .single();

      if (reportError) throw reportError;

      // Load sections
      const { data: sections, error: sectionsError } = await supabase
        .from("report_sections")
        .select("*")
        .eq("report_id", reportId)
        .order("order_index");

      if (sectionsError) throw sectionsError;

      // Load images for each section
      const loadedSections: PhotoSection[] = [];
      for (const section of sections || []) {
        const { data: images, error: imagesError } = await supabase
          .from("report_images")
          .select("*")
          .eq("section_id", section.id)
          .order("order_index");

        if (imagesError) throw imagesError;

        loadedSections.push({
          id: section.id,
          title: section.title,
          photos: (images || []).map((img) => ({
            id: img.id,
            file: new File([], "placeholder"),
            preview: img.image_url,
            caption: img.caption || "",
          })),
        });
      }

      return {
        jobInfo: {
          clientName: report.client_name,
          dateTime: report.date_time || "",
          location: report.location || "",
          reporterName: report.reporter_name || "",
          logo: report.logo_url,
          footerNote: "ขอบคุณที่ไว้วางใจใช้บริการ\nหากพบปัญหาการใช้งาน กรุณาติดต่อ...",
        },
        sections: loadedSections,
        conclusion: report.conclusion || "",
      };
    } catch (error) {
      console.error("Error loading report:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายงานได้",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (reportId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "ลบสำเร็จ",
        description: "รายงานถูกลบแล้ว",
      });
      return true;
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรายงานได้",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    saveReport,
    loadReports,
    loadReport,
    deleteReport,
    isSaving,
    isLoading,
  };
};
