import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { AssetStatusChart } from './AssetStatusChart';
import { AssetTypeChart } from './AssetTypeChart';
import { RecentAssets } from './RecentAssets';
import { WarrantyAlerts } from './WarrantyAlerts';

// Mock data - Replace with actual API calls
const mockData = {
  totalAssets: 150,
  totalUsers: 45,
  totalDepartments: 8,
  assetsNeedingAttention: 12,
};

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ComputerIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Assets
                </Typography>
              </Box>
              <Typography variant="h4">{mockData.totalAssets}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h4">{mockData.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Departments
                </Typography>
              </Box>
              <Typography variant="h4">{mockData.totalDepartments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Needs Attention
                </Typography>
              </Box>
              <Typography variant="h4" color="error">
                {mockData.assetsNeedingAttention}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Tables */}
      <Grid container spacing={3}>
        {/* Asset Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Asset Status Distribution
            </Typography>
            <AssetStatusChart />
          </Paper>
        </Grid>

        {/* Asset Type Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Asset Types
            </Typography>
            <AssetTypeChart />
          </Paper>
        </Grid>

        {/* Recent Assets */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Recent Assets
            </Typography>
            <RecentAssets />
          </Paper>
        </Grid>

        {/* Warranty Alerts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Warranty Alerts
            </Typography>
            <WarrantyAlerts />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 