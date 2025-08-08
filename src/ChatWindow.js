import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton, TextField, Dialog, DialogContent, LinearProgress, Alert, Tooltip, Typography, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import config from './config';

export default function ChatWindow({ user, open, minimized, onClose, onMinimize, messages, onSend, chatInput, setChatInput }) {
  const messagesEndRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordTimer, setRecordTimer] = useState(0);
  const recordTimerRef = useRef();
  const fileInputRef = useRef();
  const [imagePreview, setImagePreview] = useState({ open: false, url: '', alt: '' });
  const [videoPreview, setVideoPreview] = useState({ open: false, url: '', alt: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [audioDuration, setAudioDuration] = useState({});
  const [videoPlaying, setVideoPlaying] = useState({});

  useEffect(() => {
    if (!minimized && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized]);

  const handleSend = async () => {
    if (!chatInput.trim() && files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    
    try {
      await onSend(chatInput, files, () => {
        setChatInput('');
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsUploading(false);
        setUploadProgress(0);
      });
    } catch (error) {
      setUploadError(error.message || 'Failed to send message');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const startRecording = async () => {
    if (recording) return;
    setRecordedChunks([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm';
      const recorder = new window.MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordTimer(0);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = () => {
        const fileExtension = mimeType === 'audio/mp4' ? 'm4a' : 'webm';
        const blob = new Blob(recordedChunks, { type: mimeType });
        const file = new File([blob], `voice-message.${fileExtension}`, { type: mimeType });
        onSend('', [file], () => {
          setRecordedChunks([]);
        });
      };
      recorder.start();
      let seconds = 0;
      recordTimerRef.current = setInterval(() => {
        seconds += 1;
        setRecordTimer(seconds);
        if (seconds >= 60) {
          recorder.stop();
          setRecording(false);
          clearInterval(recordTimerRef.current);
        }
      }, 1000);
    } catch (err) {
      setRecording(false);
      setRecordTimer(0);
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      clearInterval(recordTimerRef.current);
    }
  };

  const handleImageClick = (url, alt) => {
    setImagePreview({ open: true, url, alt });
  };

  const handleVideoClick = (url, alt) => {
    setVideoPreview({ open: true, url, alt });
  };

  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File ${file.name} is too large. Maximum size is 50MB.`);
    }
    return true;
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    try {
      selectedFiles.forEach(validateFile);
      setFiles(prev => [...prev, ...selectedFiles]);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAudioPlay = (audioUrl, messageId) => {
    if (playingAudio === messageId) {
      setPlayingAudio(null);
      setAudioProgress(prev => ({ ...prev, [messageId]: 0 }));
    } else {
      setPlayingAudio(messageId);
      
      const audio = new Audio();
      
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        setPlayingAudio(null);
        alert('Failed to load audio file. Please try again.');
      });
      
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(prev => ({ ...prev, [messageId]: audio.duration }));
      });
      
      audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(prev => ({ ...prev, [messageId]: progress }));
      });
      
      audio.addEventListener('ended', () => {
        setPlayingAudio(null);
        setAudioProgress(prev => ({ ...prev, [messageId]: 0 }));
      });
      
      audio.src = audioUrl;
      audio.load();
      
      audio.play().catch(err => {
        console.error('Audio playback failed:', err);
        setPlayingAudio(null);
        alert('Failed to play audio. Please check if the file exists.');
      });
    }
  };

  const handleVideoPlay = (videoUrl, messageId) => {
    setVideoPlaying(prev => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMediaUrl = (url) => {
    if (url.startsWith('http')) {
      return url;
    }
    return config.getMediaUrl(url);
  };

  if (minimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20 + (user.index || 0) * 20,
          width: 300,
          height: 60,
          bgcolor: '#007bff',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          '&:hover': { bgcolor: '#0056b3' }
        }}
        onClick={onMinimize}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            src={user.photo_url} 
            sx={{ width: 32, height: 32, bgcolor: '#fff', color: '#007bff' }}
          >
            {user.full_name ? user.full_name[0] : 'U'}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {user.full_name || user.username || 'User'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onClose(); }} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20 + (user.index || 0) * 20,
        width: 380,
        height: 500,
        maxWidth: '95vw',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        zIndex: 9999,
        bgcolor: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
        border: '1px solid #e0e0e0'
      }}
    >
      <Box 
        sx={{ 
          bgcolor: '#007bff',
          color: 'white',
          p: 2,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderRadius: '16px 16px 0 0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            src={user.photo_url} 
            sx={{ width: 40, height: 40, bgcolor: '#fff', color: '#007bff' }}
          >
            {user.full_name ? user.full_name[0] : 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {user.full_name || user.username || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {user.is_online ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Minimize">
            <IconButton size="small" onClick={onMinimize} sx={{ color: 'white' }}>
              <MinimizeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          bgcolor: '#f0f2f5',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {messages.map((msg, i) => {
          const prevMsg = i > 0 ? messages[i - 1] : null;
          const showDate = !prevMsg || (msg.timestamp && prevMsg && prevMsg.timestamp && msg.timestamp.slice(0, 10) !== prevMsg.timestamp.slice(0, 10));
          const isAdmin = msg.sender === 'admin';
          const initials = isAdmin ? 'A' : (user.full_name ? user.full_name[0] : 'U');
          const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;

          return (
            <React.Fragment key={msg.message + '-' + i}>
              {showDate && msg.timestamp && (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Chip 
                    label={new Date(msg.timestamp).toLocaleDateString()} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(0,0,0,0.1)', fontSize: '0.75rem' }}
                  />
                </Box>
              )}
              <Box sx={{
                display: 'flex',
                flexDirection: isAdmin ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                mb: showAvatar ? 1.5 : 0.5,
                gap: 1
              }}>
                {showAvatar && (
                  <Avatar 
                    src={isAdmin ? null : user.photo_url} 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: isAdmin ? '#007bff' : '#e0e0e0',
                      color: isAdmin ? 'white' : '#666'
                    }}
                  >
                    {initials}
                  </Avatar>
                )}
                {!showAvatar && <Box sx={{ width: 32 }} />}
                
                <Box sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isAdmin ? 'flex-end' : 'flex-start'
                }}>
                  <Box sx={{
                    bgcolor: isAdmin ? '#007bff' : 'white',
                    color: isAdmin ? 'white' : '#000',
                    borderRadius: isAdmin
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    px: 2, 
                    py: 1.2,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    fontSize: '0.9rem',
                    wordBreak: 'break-word',
                    position: 'relative'
                  }}>
                    {(() => {
                      if (msg.message && (msg.message.startsWith('[image]') || msg.message.startsWith('[gif]'))) {
                        const url = msg.message.replace('[image]', '').replace('[gif]', '');
                        const isValidUrl = url.startsWith('/media/') || url.startsWith('http');
                        
                        if (isValidUrl) {
                          const fullUrl = getMediaUrl(url);
                          const fileExtension = config.getFileExtension(fullUrl);
                          const isGif = msg.message.startsWith('[gif]') || config.isGif(fullUrl) || fileExtension === 'gif';
                          
                          return (
                            <Box sx={{ 
                              position: 'relative',
                              display: 'inline-block',
                              maxWidth: 200,
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }
                            }}>
                              <img 
                                src={fullUrl} 
                                alt={isGif ? "Animated GIF" : "Image"} 
                                style={{ 
                                  width: '100%',
                                  height: 'auto',
                                  maxHeight: 200,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  ...(isGif && {
                                    imageRendering: 'auto',
                                    willChange: 'auto'
                                  })
                                }}
                                onClick={() => handleImageClick(fullUrl, isGif ? 'Animated GIF' : 'Image')}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                                key={isGif ? `${fullUrl}-${Date.now()}` : fullUrl}
                              />
                              {isGif && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  zIndex: 1
                                }}>
                                  GIF
                                </Box>
                              )}
                              <Box sx={{
                                display: 'none',
                                width: '100%',
                                height: 100,
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.1)',
                                borderRadius: 8,
                                fontSize: 12,
                                color: 'rgba(0,0,0,0.6)'
                              }}>
                                Image not available
                              </Box>
                            </Box>
                          );
                        }
                        return (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            minWidth: 180,
                            maxWidth: 280,
                            bgcolor: 'rgba(255,0,0,0.1)',
                            borderRadius: 2,
                            p: 1
                          }}>
                            <Typography variant="caption" sx={{ color: 'error.main' }}>
                              Image not available
                            </Typography>
                          </Box>
                        );
                      } else if (msg.message && msg.message.startsWith('[video]')) {
                        const url = msg.message.replace('[video]', '');
                        const isValidUrl = url.startsWith('/media/') || url.startsWith('http');
                        
                        console.log('Processing video message:', msg.message, 'URL:', url, 'Valid:', isValidUrl);
                        
                        if (isValidUrl) {
                          const fullUrl = getMediaUrl(url);
                          const messageId = `${msg.timestamp}-${i}`;
                          const isVideoPlaying = videoPlaying[messageId];
                          
                          console.log('Rendering video with URL:', fullUrl);
                          
                          // Test if the URL is accessible
                          fetch(fullUrl, { method: 'HEAD' })
                            .then(response => {
                              console.log('Video URL accessibility test:', fullUrl, 'Status:', response.status);
                            })
                            .catch(error => {
                              console.error('Video URL not accessible:', fullUrl, error);
                            });
                          
                          return (
                            <Box sx={{ 
                              position: 'relative',
                              display: 'inline-block',
                              maxWidth: 200,
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }
                            }}
                            onClick={() => handleVideoClick(fullUrl, 'Video sent by user')}>
                              <video 
                                src={fullUrl} 
                                controls={false}
                                preload="metadata"
                                poster="" // Add poster for better preview
                                style={{ 
                                  width: '100%',
                                  height: 'auto',
                                  maxHeight: 200,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  backgroundColor: '#000' // Add background color for better visibility
                                }}
                                onError={(e) => {
                                  console.error('Video failed to load:', fullUrl, e);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                                onLoadStart={() => {
                                  console.log('Video loading started for:', fullUrl);
                                }}
                                onLoadedData={() => {
                                  console.log('Video loaded successfully:', fullUrl);
                                }}
                                onPlay={() => setVideoPlaying(prev => ({ ...prev, [messageId]: true }))}
                                onPause={() => setVideoPlaying(prev => ({ ...prev, [messageId]: false }))}
                                onEnded={() => setVideoPlaying(prev => ({ ...prev, [messageId]: false }))}
                              />
                              
                              {/* Video thumbnail overlay for better preview */}
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0,0,0,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none'
                              }}>
                                <Box sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: '50%',
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: 24
                                }}>
                                  ▶
                                </Box>
                              </Box>
                              
                              {/* Video duration indicator */}
                              <Box sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                fontWeight: 500
                              }}>
                                🎥 Video
                              </Box>
                              
                              {/* Custom video controls overlay */}
                              <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.8)',
                                  transform: 'translate(-50%, -50%) scale(1.1)'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const videoElement = e.target.closest('div').parentElement.querySelector('video');
                                if (videoElement && typeof videoElement.play === 'function') {
                                  if (isVideoPlaying) {
                                    videoElement.pause();
                                  } else {
                                    videoElement.play().catch(err => {
                                      console.error('Error playing video:', err);
                                    });
                                  }
                                } else {
                                  console.error('Video element not found or play method not available');
                                }
                              }}>
                                {isVideoPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                              </Box>
                              
                              {/* Fallback when video fails to load */}
                              <Box sx={{
                                display: 'none',
                                width: '100%',
                                height: 100,
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.1)',
                                borderRadius: 8,
                                fontSize: 12,
                                color: 'rgba(0,0,0,0.6)',
                                flexDirection: 'column',
                                gap: 1
                              }}>
                                <Box sx={{ fontSize: 24 }}>🎥</Box>
                                <Typography variant="caption">Video not available</Typography>
                                <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.7 }}>
                                  Click to open
                                </Typography>
                              </Box>
                              
                              {/* Alternative: Show as a clickable video card */}
                              <Box sx={{
                                display: 'none',
                                width: '100%',
                                height: 120,
                                bgcolor: 'rgba(0,0,0,0.05)',
                                borderRadius: 8,
                                border: '2px dashed rgba(0,0,0,0.2)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: 1,
                                cursor: 'pointer'
                              }}
                              onClick={() => handleVideoClick(fullUrl, 'Video')}>
                                <Box sx={{ fontSize: 32, opacity: 0.6 }}>🎥</Box>
                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                  Video Message
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.7 }}>
                                  Click to view
                                </Typography>
                              </Box>
                            </Box>
                          );
                        }
                        // Handle invalid video URL
                        return (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            minWidth: 180,
                            maxWidth: 280,
                            bgcolor: 'rgba(255,0,0,0.1)',
                            borderRadius: 2,
                            p: 1
                          }}>
                            <Typography variant="caption" sx={{ color: 'error.main' }}>
                              Video not available
                            </Typography>
                          </Box>
                        );
                      } else if (msg.message && (msg.message.includes('[voice]') || msg.message.includes('[audio]') || msg.message.includes('[file]'))) {
                        let url = msg.message;
                        url = url.replace(/\[voice\]/g, '').replace(/\[audio\]/g, '').replace(/\[file\]/g, '');
                        
                        const isValidUrl = url.startsWith('/media/') || url.startsWith('http') || url.includes('.m4a') || url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg') || url.includes('.webm');
                        
                        if (isValidUrl) {
                          const fullUrl = getMediaUrl(url);
                          const messageId = `${msg.timestamp}-${i}`;
                          const isPlaying = playingAudio === messageId;
                          const duration = audioDuration[messageId] || 0;
                          const progress = audioProgress[messageId] || 0;
                          
                          return (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              minWidth: 180,
                              maxWidth: 280,
                              bgcolor: isAdmin ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                              borderRadius: 2,
                              p: 1
                            }}>
                              <IconButton
                                size="small"
                                onClick={() => handleAudioPlay(fullUrl, messageId)}
                                sx={{ 
                                  bgcolor: isAdmin ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.1)',
                                  color: isAdmin ? 'white' : '#007bff',
                                  '&:hover': {
                                    bgcolor: isAdmin ? 'rgba(255,255,255,0.3)' : 'rgba(0,123,255,0.2)'
                                  },
                                  width: 32,
                                  height: 32
                                }}
                              >
                                {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                              </IconButton>
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <VolumeUpIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                                  <Box sx={{ flex: 1, height: 3, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                    <Box 
                                      sx={{ 
                                        height: '100%', 
                                        bgcolor: isAdmin ? 'white' : '#007bff',
                                        width: `${progress}%`,
                                        transition: 'width 0.1s ease'
                                      }} 
                                    />
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                                    {formatTime(duration * (progress / 100))} / {formatTime(duration)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.6rem' }}>
                                    {msg.message.includes('[voice]') ? '🎤 Voice' : msg.message.includes('[audio]') ? '🎵 Audio' : '📎 File'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        }
                        const filename = url || 'voice-message.m4a';
                        const audioUrl = filename.startsWith('/media/') ? getMediaUrl(filename) : getMediaUrl(`/media/${filename}`);
                        const messageId = `${msg.timestamp}-${i}`;
                        const isPlaying = playingAudio === messageId;
                        const duration = audioDuration[messageId] || 0;
                        const progress = audioProgress[messageId] || 0;
                        
                        return (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            minWidth: 180,
                            maxWidth: 280,
                            bgcolor: isAdmin ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            borderRadius: 2,
                            p: 1
                          }}>
                            <IconButton
                              size="small"
                              onClick={() => handleAudioPlay(audioUrl, messageId)}
                              sx={{ 
                                bgcolor: isAdmin ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.1)',
                                color: isAdmin ? 'white' : '#007bff',
                                '&:hover': {
                                  bgcolor: isAdmin ? 'rgba(255,255,255,0.3)' : 'rgba(0,123,255,0.2)'
                                },
                                width: 32,
                                height: 32
                              }}
                            >
                              {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                            </IconButton>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <VolumeUpIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                                <Box sx={{ flex: 1, height: 3, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                  <Box 
                                    sx={{ 
                                      height: '100%', 
                                      bgcolor: isAdmin ? 'white' : '#007bff',
                                      width: `${progress}%`,
                                      transition: 'width 0.1s ease'
                                    }} 
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                                  {formatTime(duration * (progress / 100))} / {formatTime(duration)}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.6rem' }}>
                                  {msg.message.includes('[voice]') ? '🎤 Voice' : msg.message.includes('[audio]') ? '🎵 Audio' : '📎 File'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      } else {
                        return msg.message;
                      }
                    })()}
                  </Box>
                  {msg.timestamp && (
                    <Box sx={{ 
                      fontSize: '0.7rem', 
                      color: '#888', 
                      textAlign: isAdmin ? 'right' : 'left', 
                      px: 1, 
                      mt: 0.5 
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isAdmin && (
                        <span style={{ marginLeft: 4, fontSize: 10 }}>
                          ✓✓
                        </span>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>
      
      {isUploading && (
        <Box sx={{ p: 1, bgcolor: '#f4f7fa' }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Box sx={{ fontSize: 12, color: '#666', mt: 0.5 }}>Uploading... {uploadProgress}%</Box>
        </Box>
      )}
      
      {uploadError && (
        <Box sx={{ p: 1 }}>
          <Alert severity="error" onClose={() => setUploadError('')} sx={{ fontSize: 12 }}>
            {uploadError}
          </Alert>
        </Box>
      )}
      
      {files && files.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1, 
          bgcolor: '#f4f7fa', 
          p: 1.5, 
          borderRadius: 2, 
          gap: 1,
          mx: 1
        }}>
          {files.map((file, idx) => (
            <Box key={file.name + idx} sx={{ position: 'relative' }}>
              {file.type && file.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name} 
                  style={{ 
                    width: 48, 
                    height: 48, 
                    objectFit: 'cover', 
                    borderRadius: 8 
                  }} 
                />
              ) : (
                <AttachFileIcon sx={{ fontSize: 40, color: '#888' }} />
              )}
              <Tooltip title="Remove">
                <IconButton 
                  size="small" 
                  onClick={() => setFiles(files.filter((_, i) => i !== idx))} 
                  sx={{ 
                    position: 'absolute', 
                    top: -8, 
                    right: -8, 
                    bgcolor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: '#ffebee'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}
      
      <Box sx={{ 
        p: 1.5, 
        borderTop: '1px solid #e0e0e0', 
        bgcolor: '#fff', 
        display: 'flex', 
        gap: 1, 
        alignItems: 'center' 
      }}>
        <Tooltip title="Attach file">
          <IconButton component="label" sx={{ color: '#666' }}>
            <AttachFileIcon />
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </IconButton>
        </Tooltip>
        
        <Box sx={{ position: 'relative' }}>
          <Tooltip title={recording ? "Recording..." : "Hold to record voice"}>
            <IconButton
              color={recording ? 'error' : 'default'}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={recording || isUploading}
              sx={{ color: recording ? '#f44336' : '#666' }}
            >
              <MicIcon />
            </IconButton>
          </Tooltip>
          {recording && (
            <Box sx={{ 
              position: 'absolute', 
              top: -30, 
              left: 0, 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: '#f44336',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem'
            }}>
              <span style={{ marginRight: 4 }}>●</span>
              Recording {recordTimer}s
            </Box>
          )}
        </Box>
        
        <TextField
          size="small"
          fullWidth
          placeholder="Type a message..."
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (chatInput.trim() || files.length > 0)) { handleSend(); } }}
          sx={{ 
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f8f9fa'
            }
          }}
          disabled={recording || isUploading}
        />
        
        <Tooltip title="Send">
          <span>
            <IconButton 
              color="primary" 
              disabled={(!chatInput.trim() && files.length === 0) || isUploading} 
              onClick={handleSend} 
              sx={{ 
                bgcolor: '#007bff',
                color: 'white',
                '&:hover': {
                  bgcolor: '#0056b3'
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#999'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      
      <Dialog 
        open={imagePreview.open} 
        onClose={() => setImagePreview({ open: false, url: '', alt: '' })}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, textAlign: 'center', position: 'relative' }}>
          <IconButton
            onClick={() => setImagePreview({ open: false, url: '', alt: '' })}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <img 
            src={imagePreview.url} 
            alt={imagePreview.alt}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '80vh', 
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={videoPreview.open} 
        onClose={() => setVideoPreview({ open: false, url: '', alt: '' })}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, textAlign: 'center', position: 'relative' }}>
          <IconButton
            onClick={() => setVideoPreview({ open: false, url: '', alt: '' })}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>
          <video 
            src={videoPreview.url} 
            controls
            style={{ 
              maxWidth: '100%', 
              maxHeight: '80vh', 
              objectFit: 'contain',
              borderRadius: 8
            }}
            autoPlay
          />
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
