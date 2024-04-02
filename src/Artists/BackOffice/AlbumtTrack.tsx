import React, { useRef, useState, useEffect } from 'react';
const AlbumTrack = ({ 
  audioPlayer, 
  src, 
  playNext, 
  isPlaying, 
  setIsPlaying, 
  trackID, 
  currentTrackID, 
  setCurrentTrackID 
}: { 
  audioPlayer: React.RefObject<InstanceType<typeof Audio>>, 
  src: string, 
  playNext: () => void, 
  isPlaying: boolean, 
  setIsPlaying: (isPlaying: boolean) => void, 
  trackID: number, 
  currentTrackID: number, 
  setCurrentTrackID: (trackID: number) => void 
}) => {
    const audioRef = audioPlayer;
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
 // const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const updateProgress = () => {
    if (audioRef.current) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.src = src;
  
      const playAudio = () => {
        if (isPlaying && trackID === currentTrackID) {
          audio.play();
        } else {
          audio.pause();
        }
      };
  
      const updateAudioProgress = () => {
        updateProgress();
      };
  
      const updateAudioDuration = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
  
      // Only add the event listeners if the track is supposed to be playing
      if (isPlaying && trackID === currentTrackID) {
        audio.addEventListener('canplaythrough', playAudio, false); // Play when the audio is ready to play
        audio.addEventListener('timeupdate', updateAudioProgress, false); // Update progress when the currentTime changes
        audio.addEventListener('loadedmetadata', updateAudioDuration, false); // Update duration when the metadata is loaded
      }
  
      // Clean up the event listeners when the component unmounts or if the track is no longer playing
      return () => {
        audio.removeEventListener('canplaythrough', playAudio);
        audio.removeEventListener('timeupdate', updateAudioProgress);
        audio.removeEventListener('loadedmetadata', updateAudioDuration);
      };
    }
  }, [src, isPlaying, trackID, currentTrackID]);


  
  const seek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (audioRef.current) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = audioRef.current.duration * percentage;
    }
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = Number(e.target.value);
    setVolume(volume);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };
  const togglePlayPause = () => {
    if (audioRef.current && audioRef.current.readyState >= 3) {
      if (isPlaying && trackID === currentTrackID) {
        audioRef.current.pause();
        setCurrentTrackID(-1); // No track is playing
        setIsPlaying(false); // Update isPlaying to false
      } else {
        if (currentTrackID === -1) {
          setCurrentTrackID(trackID); // Set currentTrackID for the first time
        }
        audioRef.current.play();
        setCurrentTrackID(trackID); // This track is playing
        setIsPlaying(true); // Update isPlaying to true
      }
    }
  };
  return (

    <div className='artisttracks'>
      <div className='pause-play-button'>
      <button onClick={togglePlayPause}>
          <i className={`fa-light fa-${isPlaying && trackID === currentTrackID ? 'pause' : 'play'}`}></i>
          {isPlaying && trackID === currentTrackID ? ' Pause' : ' Play'}
        </button>
      </div>
    
      <div className='progress-bar' onClick={seek}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#007bff' }} />
      </div>
      <div className='input-bar'> <input type="range" min="0" max="1" step="0.01" value={volume} onChange={changeVolume} /></div>
     
      <div>Current Time: {formatTime(currentTime)} / {formatTime(duration)}</div>
      <audio src={src} ref={audioRef} onEnded={() => { console.log('onEnded event fired'); playNext(); }} />
    </div>
   
  );
};

export default AlbumTrack;