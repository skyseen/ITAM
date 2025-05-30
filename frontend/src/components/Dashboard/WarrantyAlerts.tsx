import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

// Mock data - Replace with actual API data
const mockAlerts = [
  {
    id: 1,
    asset_id: 'LAP-001',
    type: 'Laptop',
    days_remaining: 30,
  },
  {
    id: 2,
    asset_id: 'MON-002',
    type: 'Monitor',
    days_remaining: 15,
  },
  {
    id: 3,
    asset_id: 'DESK-003',
    type: 'Desktop',
    days_remaining: 7,
  },
];

export const WarrantyAlerts: React.FC = () => {
  return (
    <List>
      {mockAlerts.map((alert) => (
        <ListItem
          key={alert.id}
          sx={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            '&:last-child': {
              borderBottom: 'none',
            },
          }}
        >
          <ListItemIcon>
            <WarningIcon color="warning" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="subtitle1">
                {alert.asset_id} - {alert.type}
              </Typography>
            }
            secondary={
              <Typography variant="body2" color="text.secondary">
                Warranty expires in {alert.days_remaining} days
              </Typography>
            }
          />
          <Chip
            label={`${alert.days_remaining} days`}
            color={alert.days_remaining <= 7 ? 'error' : 'warning'}
            size="small"
          />
        </ListItem>
      ))}
    </List>
  );
}; 