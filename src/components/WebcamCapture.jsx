import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { 
  Button, 
  CircularProgress, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper
} from '@mui/material';
import { Camera, PersonAdd } from '@mui/icons-material';

const WebcamCapture = ({ onAttendanceMarked, knownFaces, onNewFaceAdded }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newFaceName, setNewFaceName] = useState('');
  const [detectedFaceDescriptor, setDetectedFaceDescriptor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load face detection models');
        console.error(err);
      }
    };

    loadModels();
    startVideo();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => {
        setError('Failed to access camera');
        console.error(err);
      });
  };

  const handleDetection = async () => {
    setIsDetecting(true);
    setError('');
    
    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        setError('No face detected');
        setIsDetecting(false);
        return;
      }

      if (detections.length > 1) {
        setError('Multiple faces detected. Please ensure only one face is visible.');
        setIsDetecting(false);
        return;
      }

      const descriptor = detections[0].descriptor;
      
      // Check if face is known
      let matchedFace = null;
      for (const knownFace of knownFaces) {
        const distance = faceapi.euclideanDistance(descriptor, knownFace.descriptor);
        if (distance < 0.6) { // Threshold for face matching
          matchedFace = knownFace;
          break;
        }
      }

      if (matchedFace) {
        onAttendanceMarked({
          name: matchedFace.name,
          timestamp: new Date(),
          confidence: (1 - faceapi.euclideanDistance(descriptor, matchedFace.descriptor)) * 100
        });
      } else {
        setDetectedFaceDescriptor(descriptor);
        setShowNameDialog(true);
      }
    } catch (err) {
      setError('Face detection failed');
      console.error(err);
    }
    
    setIsDetecting(false);
  };

  const handleNewFaceSubmit = () => {
    if (newFaceName.trim() && detectedFaceDescriptor) {
      onNewFaceAdded({
        name: newFaceName.trim(),
        descriptor: detectedFaceDescriptor
      });
      onAttendanceMarked({
        name: newFaceName.trim(),
        timestamp: new Date(),
        confidence: 100
      });
      setShowNameDialog(false);
      setNewFaceName('');
      setDetectedFaceDescriptor(null);
    }
  };

  return (
    <Paper elevation={3} className="p-4">
      <div className="relative w-full max-w-2xl mx-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
            <CircularProgress color="primary" />
          </div>
        )}
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full rounded-lg shadow-xl"
            style={{ minHeight: '400px' }}
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>

        {error && (
          <Alert severity="error" className="mt-4">
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleDetection}
          disabled={isLoading || isDetecting}
          startIcon={isDetecting ? <CircularProgress size={20} color="inherit" /> : <Camera />}
          className="mt-4"
        >
          {isDetecting ? 'Detecting...' : 'Mark Attendance'}
        </Button>
      </div>

      <Dialog open={showNameDialog} onClose={() => setShowNameDialog(false)}>
        <DialogTitle>New Face Detected</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter Your Name"
            fullWidth
            value={newFaceName}
            onChange={(e) => setNewFaceName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNameDialog(false)}>Cancel</Button>
          <Button onClick={handleNewFaceSubmit} color="primary" startIcon={<PersonAdd />}>
            Add Person
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default WebcamCapture;