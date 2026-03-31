import { useState, useCallback, useRef } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
  isEmpty?: boolean;
}

const DropZone = ({ onFilesSelected, className, isEmpty = true }: DropZoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  }, [onFilesSelected]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [onFilesSelected]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isEmpty) {
    // Compact version when photos exist
    return (
      <button
        onClick={handleClick}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-all duration-200",
          isDragActive 
            ? "border-accent bg-accent/10 text-accent" 
            : "border-border hover:border-primary/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground",
          className
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="w-5 h-5" />
        <span className="font-medium">
          {isDragActive ? "วางรูปภาพที่นี่" : "ลากรูปมาวาง หรือ คลิกเพื่อเลือก"}
        </span>
      </button>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
        isDragActive 
          ? "border-accent bg-accent/10" 
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className={cn(
        "p-4 rounded-full mb-4 transition-colors",
        isDragActive ? "bg-accent/20" : "bg-muted"
      )}>
        {isDragActive ? (
          <Upload className="w-10 h-10 text-accent" />
        ) : (
          <ImagePlus className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
      
      <p className={cn(
        "text-lg font-medium mb-2 transition-colors",
        isDragActive ? "text-accent" : "text-foreground"
      )}>
        {isDragActive ? "วางรูปภาพที่นี่" : "ลากรูปภาพมาวางที่นี่"}
      </p>
      
      <p className="text-sm text-muted-foreground mb-4">
        หรือ
      </p>
      
      <div className="btn-secondary pointer-events-none">
        <Upload className="w-4 h-4" />
        <span>เลือกรูปภาพ</span>
      </div>
      
      <p className="text-xs text-muted-foreground mt-4">
        รองรับไฟล์ JPG, PNG, GIF (เลือกได้หลายรูป)
      </p>
    </div>
  );
};

export default DropZone;
