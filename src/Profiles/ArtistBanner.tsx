import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const ArtistBanner = () => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      const token = localStorage.getItem('userJWTToken');
      let userId = '';
      if (token) {
        const decodedToken: any = jwtDecode(token);
        userId = decodedToken.nameid;
      }

      try {
        const response = await fetch(`http://192.168.1.80:5053/api/artistprofile/getartistbannerlogo/${userId}`);
        if (response.ok) {
          const url = await response.text() ?? null;
          setImageUrl(url);
        } else {
          console.error('Failed to fetch image URL');
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
      }
    };

    fetchImage();
  }, []);

  if (!imageUrl) {
    return <div>Loading...</div>;
  }

  return <img src={imageUrl} alt="Artist banner" />;
};

export default ArtistBanner;