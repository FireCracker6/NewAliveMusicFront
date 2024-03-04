
import React, { Ref, RefObject, useEffect, useRef, useState } from 'react';
import p5, { FILTER_TYPE } from 'p5';

interface ImageManipulationProps {
  sketchRef: RefObject<HTMLDivElement>;
  bannerImagePath?: string;
  logoImagePath?: string;
  zoom: number;
  scale: number;
  // opacity: number,
  logoOpacity: number;
  bannerOpacity: number;
  backgroundColor: number;
  bannerFilter: number;
  logoFilter: number;
  onSaveCanvasContent?: (canvasContent: string) => void;
  p5Instance: p5 | null; // Add this line
  setP5Instance: React.Dispatch<React.SetStateAction<p5 | null>>; // Add this line
}
const ImageManipulation: React.FC<ImageManipulationProps> = ({
  sketchRef,
  bannerImagePath,
  logoImagePath,
  zoom,
  scale,
  // opacity,
  logoOpacity,
  bannerOpacity,
  backgroundColor,
  bannerFilter,
  logoFilter,
  onSaveCanvasContent,
  p5Instance, // Add this line
  setP5Instance, // Add this line



}) => {

  const [zoomState, setZoomState] = useState(zoom);
  const [scaleState, setScaleState] = useState(scale);
  const [bannerOpacityState, setBannerOpacityState] = useState(bannerOpacity);
  const [logoOpacityState, setLogoOpacityState] = useState(logoOpacity);

  const [bannerFilterState, setBannerFilterState] = useState(bannerFilter);
  const [logoFilterState, setLogoFilterState] = useState(logoFilter);
  const [bannerZoomState, setBannerZoomState] = useState(zoom);
  const [logoScaleState, setLogoScaleState] = useState(scale);

  const pRef = useRef<p5 | null>(null);

  // Move these outside of the useEffect
  const bannerPos = useRef(new p5.Vector(0, 0)); // Initial position for the banner image.
  const logoPos = useRef(new p5.Vector(100, 100)); // Initial draggable position for the logo image.

  const zoomRef = useRef(zoom);
  const scaleRef = useRef(scale);
  //const opacityRef = useRef(opacity);

  const logoOpacityRef = useRef(logoOpacity);
  const bannerOpacityRef = useRef(bannerOpacity);

  const bannerFilterRef = useRef(bannerFilter);
  const logoFilterRef = useRef(logoFilter);

  let canvas: p5.Renderer;

  const colorPalette = [
    [128, 128, 128], // Add grayscale color
    [255, 255, 255],
    [0, 0, 0],
    [255, 0, 0]
];

  const backgroundColorRef = useRef(backgroundColor);


  useEffect(() => {
    backgroundColorRef.current = backgroundColor;
  }, [backgroundColor]);

  useEffect(() => {
    setZoomState(zoom);
    setScaleState(scale);
  }, [zoom, scale]);

  useEffect(() => {
    setBannerOpacityState(bannerOpacity)
  }, [bannerOpacity]);

  useEffect(() => {
    setLogoOpacityState(logoOpacity)
  }, [logoOpacity]);

  useEffect(() => {
    setBannerFilterState(bannerFilter);
  }, [bannerFilter]);

  useEffect(() => {
    setLogoFilterState(logoFilter);
  }, [logoFilter])


  useEffect(() => {
    setBannerZoomState(zoom);
    setLogoScaleState(scale);
  }, [zoom, scale]);

  useEffect(() => {
    zoomRef.current = zoom;
    scaleRef.current = scale;
  }, [zoom, scale]);

  useEffect(() => {
    logoOpacityRef.current = logoOpacity;
  }, [logoOpacity]);

  useEffect(() => {
    bannerOpacityRef.current = bannerOpacity;
  }, [bannerOpacity]);

  useEffect(() => {
    bannerFilterRef.current = bannerFilter;
  }, [bannerFilter]);

  useEffect(() => {
    logoFilterRef.current = logoFilter;
  }, [logoFilter]);



  useEffect(() => {
    let bannerImg: p5.Image | null = null;
    let logoImg: p5.Image | null = null;

    let draggingBanner = false;
    let draggingLogo = false;
    let offsetX = 0;
    let offsetY = 0;

    const sketch = (p: p5) => {
      p.preload = () => {
        pRef.current = p;
        // Conditionally load images if paths are provided.
        if (bannerImagePath) bannerImg = p.loadImage(bannerImagePath);
        if (logoImagePath) logoImg = p.loadImage(logoImagePath);
        
      };

      let bannerGraphics: p5.Graphics;
      let logoGraphics: p5.Graphics;

      let filterTypes: p5.FILTER_TYPE[];

      let currentBannerFilter: number;
      let currentLogoFilter: number;

      // p.setup = () => {

      //   currentBannerFilter = bannerFilterRef.current;
      //   currentLogoFilter = logoFilterRef.current;
      //   filterTypes = ["threshold", "gray", "opaque", "invert", "posterize", "erode", "dilate", "blur"];
      //   const width = sketchRef.current ? sketchRef.current.clientWidth : p.windowWidth;
      //   const parentElement = sketchRef.current || undefined;
      //   p.createCanvas(width, 400).parent(parentElement ?? '');
      //   setP5Instance(p)
      //   p.background(200);

      //   if (bannerImg) {
      //     bannerImg.loadPixels();
      //     bannerGraphics = p.createGraphics(bannerImg.width, bannerImg.height);
      //     bannerGraphics.image(bannerImg, 0, 0);
      //     // bannerGraphics.filter(filterTypes[bannerFilterRef.current]);
      //   }

      //   if (logoImg) {
      //     logoImg.loadPixels();
      //     logoGraphics = p.createGraphics(logoImg.width, logoImg.height);
      //     logoGraphics.image(logoImg, 0, 0);
      //     //  logoGraphics.filter(filterTypes[logoFilterRef.current]);
      //   }
      //   canvas = p.createCanvas(width, 400).parent(parentElement ?? '');
      //   p.textSize(32);
      //   p.textAlign(p.CENTER, p.CENTER);
      //   p.text('Upload your images here...', p.width / 2, p.height / 2);
      // };
      p.setup = () => {
        currentBannerFilter = bannerFilterRef.current;
        currentLogoFilter = logoFilterRef.current;
        filterTypes = ["threshold", "gray", "opaque", "invert", "posterize", "erode", "dilate", "blur"];
        const width = sketchRef.current ? sketchRef.current.clientWidth : p.windowWidth;
        const parentElement = sketchRef.current || undefined;
        canvas = p.createCanvas(width, 400).parent(parentElement ?? '');
        setP5Instance(p)
        p.background(200);
    
        if (bannerImg) {
          bannerImg.loadPixels();
          bannerGraphics = p.createGraphics(bannerImg.width, bannerImg.height);
          bannerGraphics.image(bannerImg, 0, 0);
          // bannerGraphics.filter(filterTypes[bannerFilterRef.current]);
        }
    
        if (logoImg) {
          logoImg.loadPixels();
          logoGraphics = p.createGraphics(logoImg.width, logoImg.height);
          logoGraphics.image(logoImg, 0, 0);
          //  logoGraphics.filter(filterTypes[logoFilterRef.current]);
        }
    
        p.textSize(32);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Upload your images here...', p.width / 2, p.height / 2);
    };


      p.draw = () => {
        p.clear();

        const bgColor = colorPalette[backgroundColorRef.current];
        p.background(bgColor[0], bgColor[1], bgColor[2]);
    
        if (!bannerImg && !logoImg) {
            p.fill(0); // Set text color to black
            p.textSize(32);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('Upload your images here...', p.width / 2, p.height / 2);
        }

        if (bannerGraphics && bannerFilterRef.current !== currentBannerFilter) {
          if (bannerImg) {
            bannerGraphics.image(bannerImg, 0, 0);
          }
          bannerGraphics.filter(filterTypes[bannerFilterRef.current]);
          currentBannerFilter = bannerFilterRef.current;
        }

        if (bannerGraphics) {
          p.tint(255, bannerOpacityRef.current * 255);
          p.image(bannerGraphics, bannerPos.current.x, bannerPos.current.y, bannerGraphics.width * zoomRef.current, bannerGraphics.height * zoomRef.current);
          p.noTint();
        }

        if (logoGraphics && logoFilterRef.current !== currentLogoFilter) {
          if (logoImg) {
            logoGraphics.image(logoImg, 0, 0);
          }
          logoGraphics.filter(filterTypes[logoFilterRef.current]);
          currentLogoFilter = logoFilterRef.current;
        }

        if (logoGraphics) {
          p.tint(255, logoOpacityRef.current * 255);
          p.image(logoGraphics, logoPos.current.x, logoPos.current.y, logoGraphics.width * scaleRef.current, logoGraphics.height * scaleRef.current);
          p.noTint();
        }
      };

      p.mousePressed = () => {
        // Detect if the mouse is over the logo image for dragging.
        if (
          logoImg &&
          p.mouseX >= logoPos.current.x &&
          p.mouseX <= logoPos.current.x + logoImg.width * logoScaleState &&
          p.mouseY >= logoPos.current.y &&
          p.mouseY <= logoPos.current.y + logoImg.height * logoScaleState
        ) {
          draggingLogo = true;
          offsetX = p.mouseX - logoPos.current.x;
          offsetY = p.mouseY - logoPos.current.y;
        }
        // Detect if the mouse is over the banner image for dragging.
        else if (
          bannerImg &&
          p.mouseX >= bannerPos.current.x &&
          p.mouseX <= bannerPos.current.x + bannerImg.width * bannerZoomState &&
          p.mouseY >= bannerPos.current.y &&
          p.mouseY <= bannerPos.current.y + bannerImg.height * bannerZoomState
        ) {
          draggingBanner = true;
          offsetX = p.mouseX - bannerPos.current.x;
          offsetY = p.mouseY - bannerPos.current.y;
        }
      };

      p.mouseDragged = () => {
        if (draggingLogo) {
          logoPos.current.set(p.mouseX - offsetX, p.mouseY - offsetY);
        }
        else if (draggingBanner) {
          bannerPos.current.set(p.mouseX - offsetX, p.mouseY - offsetY);
        }
      };

      p.mouseReleased = () => {
        draggingLogo = false;
        draggingBanner = false;
      };
    };

    if (sketchRef.current) {
      const myP5 = new p5(sketch, sketchRef.current);
      return () => myP5.remove();
    }
    
  }, [bannerImagePath, logoImagePath]); // React to changes in image paths, zoom, and scale.

  const saveCanvasContent = () => {
    if (!p5Instance) {
      console.error('p5 instance is not initialized.');
      return;
    }
    if (canvas) {
      const canvasContent = (canvas.elt as HTMLCanvasElement).toDataURL();
      console.log(canvasContent)
      if (onSaveCanvasContent) {
        onSaveCanvasContent(canvasContent);
      }
    }
  };

  return (
    <div>
      <div ref={sketchRef} style={{ width: '100%', minHeight: '400px' }}></div>
      <button onClick={saveCanvasContent}>Save Canvas Content</button>
    </div>
  );
};

export default ImageManipulation;