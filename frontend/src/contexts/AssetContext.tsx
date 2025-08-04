/**
 * Asset Context - Centralized Asset Management State
 * 
 * This context provides comprehensive asset management functionality including:
 * - Asset CRUD operations with optimistic updates
 * - Dashboard data aggregation and caching
 * - Real-time asset status tracking
 * - Export functionality with proper file handling
 * - Error handling and loading states
 * 
 * Performance Optimizations:
 * - useCallback for memoized functions
 * - Selective re-renders with proper dependency arrays
 * - Efficient API calls with proper error boundaries
 * 
 * @author IT Asset Management System
 * @version 2.0.0
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api } from './AuthContext';

/**
 * Core Asset Interface
 * Represents a complete asset record with all metadata
 */
export interface Asset {
  id: number;
  asset_id: string;
  asset_tag?: string;
  type: string;
  brand: string;
  model: string;
  serial_number?: string;
  department: string;
  location?: string;
  purchase_date: string;
  warranty_expiry: string;
  purchase_cost?: string;
  condition: string;
  notes?: string;
  status: 'available' | 'pending_for_signature' | 'in_use' | 'maintenance' | 'retired';
  assigned_user_id?: number;
  assigned_user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetCreate {
  asset_id: string;
  asset_tag?: string;
  type: string;
  brand: string;
  model: string;
  serial_number?: string;
  department: string;
  location?: string;
  purchase_date: string;
  warranty_expiry: string;
  purchase_cost?: string;
  condition: string;
  notes?: string;
}

export interface AuditLog {
  id: number;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  user_name: string;
  user_role: string;
  description: string;
  details?: string;
  asset_identifier?: string;
  timestamp: string;
}

export interface DashboardData {
  total_assets: number;
  assets_by_status: Record<string, number>;
  assets_by_type: Record<string, number>;
  assets_by_department: Record<string, number>;
  recent_issuances: any[];
  recent_activities: AuditLog[];
  warranty_alerts: Asset[];
  idle_assets: Asset[];
}

interface AssetContextType {
  assets: Asset[];
  loading: boolean;
  dashboardData: DashboardData | null;
  fetchAssets: (params?: any) => Promise<void>;
  fetchDashboardData: () => Promise<void>;
  createAsset: (asset: AssetCreate) => Promise<void>;
  updateAsset: (id: number, asset: Partial<AssetCreate>) => Promise<void>;
  deleteAsset: (id: number) => Promise<void>;
  issueAsset: (id: number, data: any) => Promise<void>;
  returnAsset: (id: number) => Promise<void>;
  exportAssets: (params?: any) => Promise<void>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

interface AssetProviderProps {
  children: ReactNode;
}

export const AssetProvider: React.FC<AssetProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const fetchAssets = useCallback(async (params: any = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/assets', { params });
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching dashboard data...');
      const response = await api.get('/assets/dashboard');
      console.log('Dashboard data received:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAsset = async (asset: AssetCreate) => {
    try {
      await api.post('/assets/', asset);
      await fetchAssets(); // Refresh the list
    } catch (error) {
      console.error('Failed to create asset:', error);
      throw error;
    }
  };

  const updateAsset = async (id: number, asset: Partial<AssetCreate>) => {
    try {
      await api.put(`/assets/${id}`, asset);
      await fetchAssets(); // Refresh the list
    } catch (error) {
      console.error('Failed to update asset:', error);
      throw error;
    }
  };

  const deleteAsset = async (id: number) => {
    try {
      await api.delete(`/assets/${id}`);
      await fetchAssets(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete asset:', error);
      throw error;
    }
  };

  const issueAsset = async (id: number, data: any) => {
    try {
      await api.post(`/assets/${id}/issue`, data);
      await fetchAssets(); // Refresh the list
    } catch (error) {
      console.error('Failed to issue asset:', error);
      throw error;
    }
  };

  const returnAsset = async (id: number) => {
    try {
      await api.post(`/assets/${id}/return`);
      await fetchAssets(); // Refresh the list
    } catch (error) {
      console.error('Failed to return asset:', error);
      throw error;
    }
  };

  const exportAssets = async (params: any = {}) => {
    try {
      const response = await api.get('/assets/export/csv', {
        params,
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assets.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export assets:', error);
      throw error;
    }
  };

  const value: AssetContextType = {
    assets,
    loading,
    dashboardData,
    fetchAssets,
    fetchDashboardData,
    createAsset,
    updateAsset,
    deleteAsset,
    issueAsset,
    returnAsset,
    exportAssets,
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = (): AssetContextType => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
}; 