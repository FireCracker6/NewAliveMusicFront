import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface ImageEditorProps {
  bannerPicURL: string;
  artistPic: File;
  logoScale?: number;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ bannerPicURL, artistPic, logoScale = 2 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current);

      if (bannerPicURL) {
        fabric.Image.fromURL(bannerPicURL, function (bannerImage) {
          bannerImage.selectable = false;
          canvas.add(bannerImage);
        canvas.setWidth(Math.max(bannerImage.width ?? 0, 800));
        canvas.setHeight(Math.max(bannerImage.height ?? 0, 600));
        canvas.renderAll();

          if (artistPic) {
            const logoUrl = URL.createObjectURL(artistPic);
            fabric.Image.fromURL(logoUrl, function (logo) {
            URL.revokeObjectURL(logoUrl);
            logo.scale(logoScale).set({
                left: canvas.width ? canvas.width / 2 : 0,
                top: canvas.height ? canvas.height / 2 : 0,
                originX: 'center',
                originY: 'center',
            });
            logo.selectable = true;
            logo.filters = logo.filters || [];
            logo.filters.push(new fabric.Image.filters.Grayscale());
            logo.applyFilters();
            canvas.add(logo);
            canvas.setActiveObject(logo);
            canvas.renderAll();
            });
          }
        });
      }
    }
  }, [bannerPicURL, artistPic, logoScale]);

  return <canvas ref={canvasRef} />;
}

export default ImageEditor;