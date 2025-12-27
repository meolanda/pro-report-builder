import { Trash2, GripVertical } from "lucide-react";
import { Photo } from "@/types/report";

interface PhotoCardProps {
  photo: Photo;
  onCaptionChange: (caption: string) => void;
  onDelete: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const PhotoCard = ({ photo, onCaptionChange, onDelete, dragHandleProps }: PhotoCardProps) => {
  return (
    <div className="photo-card animate-slide-up group">
      <div className="relative h-64 bg-muted overflow-hidden rounded-lg shadow-sm">
        <img
          src={photo.preview}
          alt={photo.caption || "รูปภาพ"}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-200 rounded-lg">
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onDelete}
              className="p-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity shadow-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="absolute top-2 left-2 p-2 bg-card/90 text-foreground rounded-md cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
      
      {/* Caption Input */}
      <div className="p-3">
        <input
          type="text"
          value={photo.caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="คำบรรยายใต้ภาพ (Optional)"
          className="w-full px-3 py-2 text-sm bg-muted border-0 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>
    </div>
  );
};

export default PhotoCard;
