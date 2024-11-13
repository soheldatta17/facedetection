import React, { useState, useEffect } from 'react';
import WebcamCapture from './components/WebcamCapture';
import AttendanceList from './components/AttendanceList';
import { Container, Typography, Grid, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [knownFaces, setKnownFaces] = useState([]);

  useEffect(() => {
    // Load known faces from localStorage
    const savedFaces = localStorage.getItem('knownFaces');
    if (savedFaces) {
      setKnownFaces(JSON.parse(savedFaces));
    }

    // Load attendance records from localStorage
    const savedRecords = localStorage.getItem('attendanceRecords');
    if (savedRecords) {
      setAttendanceRecords(JSON.parse(savedRecords));
    }
  }, []);

  const handleAttendanceMarked = (record) => {
    const newRecords = [record, ...attendanceRecords];
    setAttendanceRecords(newRecords);
    localStorage.setItem('attendanceRecords', JSON.stringify(newRecords));
  };

  const handleNewFaceAdded = (newFace) => {
    const updatedFaces = [...knownFaces, newFace];
    setKnownFaces(updatedFaces);
    localStorage.setItem('knownFaces', JSON.stringify(updatedFaces));
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gray-100 py-8">
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" align="center" gutterBottom>
            Face Recognition Attendance System
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
            Quick and secure attendance tracking using facial recognition
          </Typography>

          <Grid container spacing={4} className="mt-4">
            <Grid item xs={12} md={6}>
              <WebcamCapture 
                onAttendanceMarked={handleAttendanceMarked}
                knownFaces={knownFaces}
                onNewFaceAdded={handleNewFaceAdded}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <AttendanceList records={attendanceRecords} />
            </Grid>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;