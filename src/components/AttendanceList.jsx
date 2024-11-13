import React from 'react';
import { format } from 'date-fns';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import {
  Person,
  AccessTime,
  CheckCircle
} from '@mui/icons-material';

const AttendanceList = ({ records }) => {
  return (
    <Paper elevation={3} className="p-4">
      <Typography variant="h5" component="h2" className="flex items-center gap-2 mb-4">
        <Person color="primary" />
        Attendance Records
      </Typography>

      {records.length === 0 ? (
        <Typography color="textSecondary" align="center" className="py-8">
          No attendance records yet
        </Typography>
      ) : (
        <List>
          {records.map((record, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary={record.name}
                  secondary={
                    <div className="flex items-center gap-2">
                      <AccessTime fontSize="small" />
                      {format(record.timestamp, 'PPpp')}
                    </div>
                  }
                />
                <Chip
                  label={`${Math.round(record.confidence)}% match`}
                  color={record.confidence > 80 ? "success" : "warning"}
                  variant="outlined"
                />
              </ListItem>
              {index < records.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default AttendanceList;