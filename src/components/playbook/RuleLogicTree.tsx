import { Rule } from '../../domain/playbook/types';

interface RuleLogicTreeProps {
    rule: Rule;
}

const getEvaluatorBadge = (metric: string) => {
    const m = metric.toLowerCase();
    if (m.includes('price') || m.includes('vwap') || m.includes('ema') || m.includes('atr')) {
        return { label: 'Price Action', color: '#3b82f6', bg: '#eff6ff' };
    }
    if (m.includes('time') || m.includes('within') || m.includes('cooldown')) {
        return { label: 'Temporal Gate', color: '#8b5cf6', bg: '#f5f3ff' };
    }
    if (m.includes('loss') || m.includes('pnl') || m.includes('trades')) {
        return { label: 'Risk / Accumulative', color: '#ef4444', bg: '#fef2f2' };
    }
    return { label: 'Comparison', color: '#10b981', bg: '#ecfdf5' };
};

export function RuleLogicTree({ rule }: RuleLogicTreeProps) {
    const conditions = rule.conditions || [];
    const edges = rule.condition_edges || [];

    return (
        <div style={{
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: 'white',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#cbd5e1' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{rule.name}</h4>
                    {rule.description && (
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{rule.description}</p>
                    )}
                </div>
                <div style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
                    {rule.category}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {conditions.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No conditions bound.</div>
                ) : (
                    conditions.map((cond, idx) => {
                        const badge = getEvaluatorBadge(cond.metric);
                        // Locate an edge matching this condition as a parent
                        const edge = idx < conditions.length - 1 ? edges.find(e => e.parent_condition_id === cond.id || e.parent_condition_id === conditions[idx + 1].id) : null;
                        const logicalOperator = edge?.logical_operator || 'AND';

                        return (
                            <div key={cond.id || idx} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #f1f5f9',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'none'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: badge.bg, color: badge.color, fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' }}>
                                            {badge.label}
                                        </div>
                                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{cond.metric}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ color: '#64748b', fontWeight: 800, backgroundColor: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                                            {cond.comparator}
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#334155', fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                                            {cond.value}
                                        </span>
                                    </div>
                                </div>

                                {idx < conditions.length - 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0', position: 'relative', height: '24px' }}>
                                        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '100%', backgroundColor: '#e2e8f0', zIndex: 0 }} />
                                        <div style={{
                                            backgroundColor: logicalOperator === 'OR' ? '#fef3c7' : '#e0e7ff',
                                            color: logicalOperator === 'OR' ? '#d97706' : '#4f46e5',
                                            border: `1px solid ${logicalOperator === 'OR' ? '#fde68a' : '#c7d2fe'}`,
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            zIndex: 1,
                                            alignSelf: 'center'
                                        }}>
                                            {logicalOperator}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
