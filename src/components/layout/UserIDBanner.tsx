import { CONFIG } from '../../config/constants';

export function UserIDBanner() {
  return (
    <div style={{
      padding: '6px 12px',
      borderRadius: '6px',
      backgroundColor: '#E0E7FF',
      color: '#3730A3',
      border: '1px solid #C7D2FE',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      fontWeight: 500,
      marginBottom: '10px'
    }}>
      <span style={{ marginRight: '8px' }}>👤</span>
      <strong>DEBUG:</strong> &nbsp;Using default hardcoded user ID ({CONFIG.USER_ID})
    </div>
  );
}
