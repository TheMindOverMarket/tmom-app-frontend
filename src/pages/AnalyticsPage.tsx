import React from 'react';
import { SessionAnalytics } from '../components/session/SessionAnalytics';

export function AnalyticsPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <SessionAnalytics />
    </div>
  );
}
