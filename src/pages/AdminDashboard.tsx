import { useEffect, useState } from 'react';
import { adminApi } from '../domain/admin/api';
import { AdminUserAnalytics } from '../domain/admin/types';
import { RefreshButton } from '../components/common/RefreshButton';
import { useNavigate } from 'react-router-dom';

import { ManagerAnalyticsDashboard } from '../components/admin/ManagerAnalyticsDashboard';

export function AdminDashboard() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <ManagerAnalyticsDashboard />
    </div>
  );
}
