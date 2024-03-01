import React, { useRef, useState } from 'react';

import ImageManipulation from './ImageManipulation';
import ArtistProfile from './ArtistProfile';
import { jwtDecode } from 'jwt-decode';
import p5 from 'p5';

const CreateArtistProfile: React.FC = () => {
  const [bannerPicURL, setBannerPicURL] = useState<string>('');
  const [artistPic, setArtistPic] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const bannerPicInput = useRef<HTMLInputElement>(null);
  const artistPicInput = useRef<HTMLInputElement>(null);
  const [backgroundColor, setBackgroundColor] = useState<number>(0);
  const [p5Instance, setP5Instance] = useState<p5 | null>(null);

  const [bannerImagePath, setBannerImagePath] = useState('');
  const [logoImagePath, setLogoImagePath] = useState('');

  const [zoom, setZoom] = useState<number>(1);
  const [scale, setScale] = useState<number>(0.25);
 // const [opacity, setOpacity] = useState<number>(1);
 const [bannerOpacity, setBannerOpacity] = useState<number>(1);
 const [logoOpacity, setLogoOpacity] = useState<number>(1);

 const [bannerFilter, setBannerFilter] = useState<number>(0);
 const [logoFilter, setLogoFilter] = useState<number>(0);


 // Save image
 const sketchRef = useRef<HTMLDivElement>(null);

 const uploadToAzure = async (blob: Blob, userId: string) => {
  const formData = new FormData();
  formData.append('file', blob, 'canvasImage.png');
  formData.append('UserProfileID', userId);
  formData.append('BannerPic', blob, 'canvasImage.png');

  try {
    const response = await fetch('http://192.168.1.80:5053/api/artistprofile/addartistimage', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await response.json();
        console.log('Upload successful', data);
        setUploadStatus('Upload successful');
      } else {
        const data = await response.text();
        console.log('Upload successful', data);
        setUploadStatus('Upload successful');
      }
    } else {
      console.error('Upload failed');
      setUploadStatus('Upload failed');
    }
  } catch (error: any) {
    console.error('Error uploading the file', error);
  }
};

const saveCanvasContent = async () => {
  console.log('saveCanvasContent triggered');
  
  // Check if the p5Instance and its drawingContext are defined
  if (!p5Instance || !p5Instance.drawingContext) {
    console.error('No canvas found');
    return;
  }

  // Access the canvas
  const canvas = p5Instance.drawingContext.canvas;

  const token = localStorage.getItem('userJWTToken');
  let userId = '';
  if (token) {
    const decodedToken: any = jwtDecode(token);
    userId = decodedToken.nameid;
  }

  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      // Create a blob from the canvas
      canvas.toBlob((blob: any) => resolve(blob), 'image/png');
    });

    // Check if the blob is correctly created
    if (!blob) {
      console.error('No blob created');
      return;
    }

    try {
      // Save the blob to Azure Blob Storage
      await uploadToAzure(blob, userId);
    } catch (error) {
      console.error('Error in uploadToAzure:', error);
    }
  } catch (error) {
    console.error('Error in canvas.toBlob:', error);
  }
};


  const handleBannerPicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result;
        console.log("Banner Data URL:", dataUrl); // Log the Data URL
        if (typeof dataUrl === 'string') {
          setBannerImagePath(dataUrl);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };


  const handleArtistPicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        setArtistPic(file);
        setLogoImagePath(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArtistButtonClick = () => {
    artistPicInput.current?.click();
  };

  const handleBannerButtonClick = () => {
    bannerPicInput.current?.click();
  };

return (
    <>
    <div ref={sketchRef} className='pt-5'>
      {/* File inputs remain the same */}
   <div className='container d-flex justify-content-center py-2'>

        <div>
      <input 
  
        type="file" 
        accept="image/*" 
        style={{display: 'none'}} 
        ref={bannerPicInput}
        onChange={handleBannerPicChange}
      />
      <button type="button" className='upload-form-button py-2' onClick={handleBannerButtonClick}>
        Upload Banner Picture
      </button>
    </div>
      <div className='pl-2'>
      <input 
        type="file" 
        accept="image/*" 
        style={{display: 'none'}} 
        ref={artistPicInput}
        onChange={handleArtistPicChange}
      />
      <button type="button" className='upload-form-button py-2' onClick={handleArtistButtonClick}>
        Upload Artist Picture
      </button>
    </div>
   </div>

     <div className='container d-flex justify-content-center'>
      <div className='labels-right'>
     <label>
          Background Color:
          <input
            type="range"
            min="0"
            max="2" // Adjust this value based on the number of colors in your palette
            step="1"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(parseInt(e.target.value))}
          />
        </label>

      {/* Slider for adjusting zoom */}
      <label>
        Zoom:
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
        />
      </label>

      {/* Slider for adjusting scale */}
      <label>
        Scale:
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
        />
      </label>
      </div>
     </div>
     <div className='container d-flex justify-content-center'>
      <div className='labels-right'>
    <label>
        Banner Opacity:
        <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={bannerOpacity}
            onChange={(e) => setBannerOpacity(parseFloat(e.target.value))}
        />
    </label>

    <label>
        Logo Opacity:
        <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={logoOpacity}
            onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
        />
    </label>

    <label>
          Background Filter:
          <input
            type="range"
            min="0"
            max="7" // Adjust this value based on the number of colors in your palette
            step="1"
            value={bannerFilter}
            onChange={(e) => setBannerFilter(parseInt(e.target.value))}
          />
        </label>

        <label>
          Logo Filter:
          <input
            type="range"
            min="0"
            max="7" // Adjust this value based on the number of colors in your palette
            step="1"
            value={logoFilter}
            onChange={(e) => setLogoFilter(parseInt(e.target.value))}
          />
        </label>
        </div>
        </div>


    </div>
    <div className='pt-5'>
          <ImageManipulation
          sketchRef={sketchRef}
           bannerImagePath={bannerImagePath}
            logoImagePath={logoImagePath}
             zoom={zoom} scale={scale} 
             bannerOpacity={bannerOpacity} 
             logoOpacity={logoOpacity}
             backgroundColor={backgroundColor}
             bannerFilter={bannerFilter}
             logoFilter={logoFilter}
             onSaveCanvasContent={saveCanvasContent}
             p5Instance={p5Instance}
             setP5Instance={setP5Instance}
              />
    </div>
    <div className='d-grid'>
    <button type='button' className='profile-form-button py-2' onClick={saveCanvasContent}>Save Banner Image</button>
    </div>
    <div className='container d-flex justify-content-center py-2'></div>
    <div><p>{uploadStatus}</p></div>
    <ArtistProfile />
   
    </>
  );

};

export default CreateArtistProfile;