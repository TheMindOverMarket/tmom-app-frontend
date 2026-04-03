interface ChartLegendProps {
  isMockData: boolean;
  symbol: string;
}

export function ChartLegend({ isMockData, symbol }: ChartLegendProps) {
  return (
    <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', pointerEvents: 'none' }}>
      <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontSize: '12px', fontFamily: 'monospace', color: '#4B5563' }}>
        {symbol} • 1m • Alpaca • EMA-9
      </div>
      
      {isMockData && (
        <div style={{ backgroundColor: 'rgba(254,243,199,0.9)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontSize: '12px', fontFamily: 'monospace', color: '#92400E', borderLeft: '4px solid #F59E0B', fontWeight: 'bold' }}>
          ⚠️ USING MOCK CANDLE DATA
        </div>
      )}
    </div>
  );
}
