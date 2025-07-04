import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Mock data - Replace with actual API data
const mockAssets = [
  {
    id: 1,
    asset_id: 'LAP-001',
    type: 'Laptop',
    brand: 'Dell',
    model: 'XPS 13',
    status: 'In Use',
    assigned_to: 'John Doe',
    department: 'IT',
    purchase_date: '2023-01-15',
  },
  {
    id: 2,
    asset_id: 'RTR-002',
    type: 'Router',
    brand: 'Cisco',
    model: 'ISR 4000',
    status: 'Available',
    assigned_to: '-',
    department: 'IT',
    purchase_date: '2023-02-20',
  },
  {
    id: 3,
    asset_id: 'DESK-003',
    type: 'Desktop',
    brand: 'HP',
    model: 'EliteDesk 800',
    status: 'Maintenance',
    assigned_to: 'Jane Smith',
    department: 'Finance',
    purchase_date: '2023-03-10',
  },
];

const columns: GridColDef[] = [
  { field: 'asset_id', headerName: 'Asset ID', width: 120 },
  { field: 'type', headerName: 'Type', width: 120 },
  { field: 'brand', headerName: 'Brand', width: 120 },
  { field: 'model', headerName: 'Model', width: 150 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'assigned_to', headerName: 'Assigned To', width: 150 },
  { field: 'department', headerName: 'Department', width: 120 },
  { field: 'purchase_date', headerName: 'Purchase Date', width: 150 },
];

export const RecentAssets: React.FC = () => {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={mockAssets}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
      />
    </div>
  );
}; 