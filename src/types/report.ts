export interface Photo {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

export interface PhotoSection {
  id: string;
  title: string;
  photos: Photo[];
}

export interface JobInfo {
  clientName: string;
  dateTime: string;
  location: string;
  reporterName: string;
  logo: string | null;
  footerNote: string;
  subject: string;
}

export interface ReportData {
  jobInfo: JobInfo;
  sections: PhotoSection[];
  conclusion: string;
}
