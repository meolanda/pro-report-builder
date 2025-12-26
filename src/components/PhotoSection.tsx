import { useState, useRef } from "react";
import { Upload, Trash2, Edit2, Check, X, ImagePlus } from "lucide-react";
import { PhotoSection as PhotoSectionType, Photo } from "@/types/report";
import PhotoCard from "./PhotoCard";

interface PhotoSectionProps {
  section: PhotoSectionType;
  onUpdate: (section: PhotoSectionType) => void;
  onDelete: () => void;
}

const PhotoSection = ({ section, onUpdate, onDelete }: PhotoSectionProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleSave = () => {
    if (editedTitle.trim()) {
      onUpdate({ ...section, title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditedTitle(section.title);
    setIsEditingTitle(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos: Photo[] = [];
      
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const photo: Photo = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: event.target?.result as string,
            caption: "",
          };
          newPhotos.push(photo);
          
          if (newPhotos.length === files.length) {
            onUpdate({
              ...section,
              photos: [...section.photos, ...newPhotos],
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCaptionChange = (photoId: string, caption: string) => {
    onUpdate({
      ...section,
      photos: section.photos.map((p) =>
        p.id === photoId ? { ...p, caption } : p
      ),
    });
  };

  const handlePhotoDelete = (photoId: string) => {
    onUpdate({
      ...section,
      photos: section.photos.filter((p) => p.id !== photoId),
    });
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= section.photos.length) return;
    
    const newPhotos = [...section.photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    
    onUpdate({ ...section, photos: newPhotos });
  };

  return (
    <div className="section-card animate-slide-up">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4 mb-5">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="input-field flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") handleTitleCancel();
              }}
            />
            <button onClick={handleTitleSave} className="p-2 text-success hover:bg-success/10 rounded-md transition-colors">
              <Check className="w-5 h-5" />
            </button>
            <button onClick={handleTitleCancel} className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <h3 className="text-lg font-semibold text-primary flex items-center gap-3">
            <span>{section.title}</span>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </h3>
        )}
        
        <div className="flex items-center gap-2">
          <label className="btn-primary cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">อัปโหลดรูป</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
          <button onClick={onDelete} className="btn-danger text-sm">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">ลบ Section</span>
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      {section.photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.photos.map((photo, index) => (
            <div key={photo.id} className="relative">
              <PhotoCard
                photo={photo}
                onCaptionChange={(caption) => handleCaptionChange(photo.id, caption)}
                onDelete={() => handlePhotoDelete(photo.id)}
              />
              {/* Move buttons */}
              <div className="absolute top-2 left-2 flex gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
                {index > 0 && (
                  <button
                    onClick={() => movePhoto(index, index - 1)}
                    className="p-1.5 bg-card/95 text-foreground rounded shadow-sm hover:bg-muted text-xs font-medium"
                  >
                    ←
                  </button>
                )}
                {index < section.photos.length - 1 && (
                  <button
                    onClick={() => movePhoto(index, index + 1)}
                    className="p-1.5 bg-card/95 text-foreground rounded shadow-sm hover:bg-muted text-xs font-medium"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/30">
          <ImagePlus className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">ยังไม่มีรูปภาพใน Section นี้</p>
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>เลือกรูปภาพ</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default PhotoSection;
