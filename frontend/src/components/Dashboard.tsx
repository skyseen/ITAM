import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface AssetStats {
  total: number;
  inUse: number;
  available: number;
  underMaintenance: number;
  retired: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AssetStats>({
    total: 0,
    inUse: 0,
    available: 0,
    underMaintenance: 0,
    retired: 0,
  });

  useEffect(() => {
    // TODO: Fetch stats from API
    // For now, using mock data
    setStats({
      total: 100,
      inUse: 45,
      available: 35,
      underMaintenance: 15,
      retired: 5,
    });
  }, []);

  const chartData = [
    { name: 'In Use', value: stats.inUse },
    { name: 'Available', value: stats.available },
    { name: 'Under Maintenance', value: stats.underMaintenance },
    { name: 'Retired', value: stats.retired },
  ];

  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>Total Assets</StatLabel>
          <StatNumber>{stats.total}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>In Use</StatLabel>
          <StatNumber>{stats.inUse}</StatNumber>
          <StatHelpText>{((stats.inUse / stats.total) * 100).toFixed(1)}%</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Available</StatLabel>
          <StatNumber>{stats.available}</StatNumber>
          <StatHelpText>{((stats.available / stats.total) * 100).toFixed(1)}%</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Under Maintenance</StatLabel>
          <StatNumber>{stats.underMaintenance}</StatNumber>
          <StatHelpText>{((stats.underMaintenance / stats.total) * 100).toFixed(1)}%</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Box h="400px">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Dashboard; 