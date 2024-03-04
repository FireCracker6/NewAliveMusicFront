import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
  exp: number;
  
}

const isTokenValid = (token: string): boolean => {
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    console.log('decodedToken', decodedToken);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    // If there's an error decoding, assume the token is invalid
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('userJWTToken');
  console.log('token from isAuthenticated', token);
  return !!token && isTokenValid(token);
};
