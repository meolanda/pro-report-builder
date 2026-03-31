import { useState, useRef, useEffect, useCallback } from "react";
import { Trash2, GripVertical, ZoomIn, ZoomOut, X, Maximize2 } from "lucide-react";
import { Photo } from "@/types/report";

interface PhotoCardProps {
  photo: Photo;
  onCaptionChange: (caption: string) => void;
  onDelete: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const PhotoCard = ({ photo, onCaptionChange, onDelete, dragHandleProps }: PhotoCardProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartMouse = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  const openLightbox = () => {
    setLightboxOpen(true);
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setScale(1);
    setPos({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const zoomIn = () => setScale((s) => Math.min(+(s + 0.5).toFixed(2), 5));
  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(+(s - 0.5).toFixed(2), 1);
      if (next === 1) setPos({ x: 0, y: 0 });
      return next;
    });
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale((s) => {
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      const next = Math.min(Math.max(+(s + delta).toFixed(2), 1), 5);
      if (next === 1) setPos({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Global mouse move/up so dragging never "breaks" when cursor leaves image
  useEffect(() => {
    if (!lightboxOpen) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartMouse.current.x;
      const dy = e.clientY - dragStartMouse.current.y;
      setPos({
        x: dragStartPos.current.x + dx,
        y: dragStartPos.current.y + dy,
      });
    };

    const onMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [lightboxOpen, isDragging]);

  // Attach wheel to the lightbox container (non-passive)
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !lightboxOpen) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [lightboxOpen, handleWheel]);

  // Close on Escape
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartMouse.current = { x: e.clientX, y: e.clientY };
    dragStartPos.current = pos;
  };

  return (
    <>
      <div className="photo-card animate-slide-up group">
        <div className="relative h-64 bg-muted overflow-hidden rounded-lg shadow-sm">
          <img
            src={photo.preview}
            alt={photo.caption || "รูปภาพ"}
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-200 rounded-lg">
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={openLightbox}
                className="p-2 bg-card/95 text-foreground rounded-md hover:bg-muted shadow-md"
                title="ดูรูปขนาดใหญ่"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {dragHandleProps && (
              <div
                {...dragHandleProps}
                className="absolute top-2 left-2 p-2 bg-card/90 text-foreground rounded-md cursor-grab opacity-0 group-hover:opacity-100 shadow-md"
              >
                <GripVertical className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Invisible click area */}
          <button
            onClick={openLightbox}
            className="absolute inset-0 w-full h-full opacity-0 cursor-zoom-in"
            aria-label="ดูรูปขนาดใหญ่"
          />
        </div>

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

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 print:hidden flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-end gap-2 p-3 shrink-0">
            <button
              onClick={zoomOut}
              disabled={scale <= 1}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-md disabled:opacity-30 transition-colors"
              title="ซูมออก"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white text-sm font-medium w-14 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 5}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-md disabled:opacity-30 transition-colors"
              title="ซูมเข้า"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={closeLightbox}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-md ml-2"
              title="ปิด (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden flex items-center justify-center"
            style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
              // Click on backdrop (not on image) closes lightbox
              if (e.target === e.currentTarget) closeLightbox();
            }}
          >
            <img
              src={photo.preview}
              alt={photo.caption || "รูปภาพ"}
              draggable={false}
              onClick={() => { if (scale === 1) zoomIn(); }}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.15s ease",
                maxWidth: "90vw",
                maxHeight: "85vh",
                objectFit: "contain",
                userSelect: "none",
                cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              }}
            />
          </div>

          {/* Hint */}
          <div className="text-center text-white/40 text-xs py-2 shrink-0 select-none">
            Scroll เพื่อซูม · ลากเพื่อเลื่อนดู · คลิกพื้นหลัง / Esc เพื่อปิด
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoCard;
