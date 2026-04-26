import { Rule } from '../../domain/playbook/types';

interface RuleLogicTreeProps {
    rule: Rule;
    isDark?: boolean;
    compact?: boolean;
}

const getPrimitiveBadge = (primitive: string, isDark: boolean = false) => {
    const p = primitive.toLowerCase();
    if (p.includes('comparison')) {
        return { 
            label: 'Condition Gate', 
            color: isDark ? 'var(--auth-accent)' : '#3b82f6', 
            bg: isDark ? 'rgba(0, 255, 136, 0.1)' : '#eff6ff',
            border: isDark ? 'rgba(0, 255, 136, 0.2)' : 'transparent'
        };
    }
    if (p.includes('temporal') || p.includes('rate_limit') || p.includes('sequence')) {
        return { 
            label: 'State Engine', 
            color: isDark ? '#a855f7' : '#8b5cf6', 
            bg: isDark ? 'rgba(168, 85, 247, 0.1)' : '#f5f3ff',
            border: isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent'
        };
    }
    if (p.includes('account') || p.includes('accumulation') || p.includes('loss') || p.includes('pnl')) {
        return { 
            label: 'Portfolio Risk', 
            color: isDark ? '#f87171' : '#ef4444', 
            bg: isDark ? 'rgba(248, 113, 113, 0.1)' : '#fef2f2',
            border: isDark ? 'rgba(248, 113, 113, 0.2)' : 'transparent'
        };
    }
    return { 
        label: 'Logic Primitive', 
        color: isDark ? '#34d399' : '#10b981', 
        bg: isDark ? 'rgba(52, 211, 153, 0.1)' : '#ecfdf5',
        border: isDark ? 'rgba(52, 211, 153, 0.2)' : 'transparent'
    };
};

const getLegacyEvaluatorBadge = (metric: string, isDark: boolean = false) => {
    const m = metric.toLowerCase();
    if (m.includes('price') || m.includes('vwap') || m.includes('ema') || m.includes('atr')) {
        return { 
            label: 'Price Action', 
            color: isDark ? 'var(--auth-accent)' : '#3b82f6', 
            bg: isDark ? 'rgba(0, 255, 136, 0.1)' : '#eff6ff',
            border: isDark ? 'rgba(0, 255, 136, 0.2)' : 'transparent'
        };
    }
    if (m.includes('time') || m.includes('within') || m.includes('cooldown')) {
        return { 
            label: 'Temporal Gate', 
            color: isDark ? '#a855f7' : '#8b5cf6', 
            bg: isDark ? 'rgba(168, 85, 247, 0.1)' : '#f5f3ff',
            border: isDark ? 'rgba(168, 85, 247, 0.2)' : 'transparent'
        };
    }
    if (m.includes('loss') || m.includes('pnl') || m.includes('trades')) {
        return { 
            label: 'Risk / Accumulative', 
            color: isDark ? '#f87171' : '#ef4444', 
            bg: isDark ? 'rgba(248, 113, 113, 0.1)' : '#fef2f2',
            border: isDark ? 'rgba(248, 113, 113, 0.2)' : 'transparent'
        };
    }
    return { 
        label: 'Comparison', 
        color: isDark ? '#34d399' : '#10b981', 
        bg: isDark ? 'rgba(52, 211, 153, 0.1)' : '#ecfdf5',
        border: isDark ? 'rgba(52, 211, 153, 0.2)' : 'transparent'
    };
};

export function RuleLogicTree({ rule, isDark = false, compact = false }: RuleLogicTreeProps) {
    const isCompiled = Array.isArray(rule.extensions) && rule.extensions.length > 0;
    const items = isCompiled ? rule.extensions! : (rule.conditions || []);
    const edges = rule.condition_edges || [];

    return (
        <div style={{
            padding: compact ? '0' : '24px',
            borderRadius: '8px',
            border: compact ? 'none' : (isDark ? '1px solid var(--auth-border)' : '1px solid #e2e8f0'),
            backgroundColor: compact ? 'transparent' : (isDark ? 'rgba(255, 255, 255, 0.01)' : 'white'),
            marginBottom: compact ? '0' : '16px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {!compact && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: isDark ? 'var(--auth-border)' : '#cbd5e1' }} />}
            {!compact && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h4 style={{ 
                            margin: '0 0 4px 0', 
                            fontSize: '18px', 
                            fontWeight: isDark ? 400 : 900, 
                            color: isDark ? '#ffffff' : '#0f172a',
                            fontFamily: isDark ? "'Cormorant Garamond', serif" : 'inherit'
                        }}>{rule.name}</h4>
                        {rule.description && (
                            <p style={{ 
                                margin: 0, 
                                fontSize: '11px', 
                                color: 'var(--auth-text-muted)', 
                                fontWeight: 500,
                                fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                            }}>{rule.description}</p>
                        )}
                    </div>
                    <div style={{ 
                        padding: '4px 10px', 
                        borderRadius: '2px', 
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9', 
                        color: isDark ? '#ffffff' : '#475569', 
                        fontSize: '10px', 
                        fontWeight: 800, 
                        textTransform: 'uppercase',
                        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
                        border: isDark ? '1px solid var(--auth-border)' : 'none'
                    }}>
                        {rule.category}
                    </div>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {items.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--auth-text-muted)', fontStyle: 'italic', fontFamily: isDark ? "'Space Mono', monospace" : 'inherit' }}>No conditions bound.</div>
                ) : (
                    items.map((cond: any, idx) => {
                        const badge = isCompiled 
                            ? getPrimitiveBadge(cond.primitive, isDark)
                            : getLegacyEvaluatorBadge(cond.metric, isDark);
                        
                        const primaryLabel = isCompiled ? cond.primitive : cond.metric;
                        
                        // Default static AND connector for compiled rules, unless parsed from legacy edges
                        let logicalOperator = 'AND';
                        if (!isCompiled && idx < items.length - 1) {
                            const edge = edges.find(e => e.parent_condition_id === cond.id || e.parent_condition_id === items[idx + 1].id);
                            if (edge) logicalOperator = edge.logical_operator;
                        }

                        return (
                            <div key={cond.id || idx} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.015)' : '#f8fafc',
                                    border: isDark ? '1px solid var(--auth-border)' : '1px solid #f1f5f9',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    transition: 'all 0.2s ease'
                                }}
                                    onMouseEnter={e => { 
                                        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1'; 
                                        e.currentTarget.style.transform = 'translateY(-1px)'; 
                                    }}
                                    onMouseLeave={e => { 
                                        e.currentTarget.style.borderColor = isDark ? 'var(--auth-border)' : '#f1f5f9'; 
                                        e.currentTarget.style.transform = 'none'; 
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            padding: '2px 8px', 
                                            borderRadius: '2px', 
                                            backgroundColor: badge.bg, 
                                            color: badge.color, 
                                            fontSize: '9px', 
                                            fontWeight: 800, 
                                            textTransform: 'uppercase',
                                            fontFamily: isDark ? "'Space Mono', monospace" : 'inherit',
                                            border: isDark ? `1px solid ${badge.border}` : 'none'
                                        }}>
                                            {badge.label}
                                        </div>
                                        <span style={{ 
                                            fontWeight: 700, 
                                            color: isDark ? '#ffffff' : '#0f172a', 
                                            fontSize: '13px',
                                            fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                                        }}>{primaryLabel}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
                                        {isCompiled ? (
                                            Object.entries(cond.params || {}).map(([key, val], i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ 
                                                        color: isDark ? 'var(--brand)' : '#64748b', 
                                                        fontWeight: 800, 
                                                        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'white', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '2px', 
                                                        border: isDark ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid #e2e8f0', 
                                                        fontSize: '11px',
                                                        fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                                                    }}>
                                                        {key}
                                                    </span>
                                                    <span style={{ 
                                                        fontWeight: 700, 
                                                        color: isDark ? 'var(--auth-accent)' : '#334155', 
                                                        fontFamily: "'Space Mono', monospace", 
                                                        fontSize: '13px', 
                                                        backgroundColor: isDark ? 'rgba(0, 255, 136, 0.05)' : '#f1f5f9', 
                                                        padding: '4px 10px', 
                                                        borderRadius: '2px',
                                                        border: isDark ? '1px solid rgba(0, 255, 136, 0.1)' : 'none'
                                                    }}>
                                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                <span style={{ 
                                                    color: isDark ? 'var(--brand)' : '#64748b', 
                                                    fontWeight: 800, 
                                                    backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'white', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '2px', 
                                                    border: isDark ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid #e2e8f0', 
                                                    fontSize: '11px',
                                                    fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
                                                }}>
                                                    {cond.comparator}
                                                </span>
                                                <span style={{ 
                                                    fontWeight: 700, 
                                                    color: isDark ? 'var(--auth-accent)' : '#334155', 
                                                    fontFamily: "'Space Mono', monospace", 
                                                    fontSize: '13px', 
                                                    backgroundColor: isDark ? 'rgba(0, 255, 136, 0.05)' : '#f1f5f9', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '2px',
                                                    border: isDark ? '1px solid rgba(0, 255, 136, 0.1)' : 'none'
                                                }}>
                                                    {cond.value}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {idx < items.length - 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0', position: 'relative', height: '24px' }}>
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '0', 
                                            left: '50%', 
                                            transform: 'translateX(-50%)', 
                                            width: '1px', 
                                            height: '100%', 
                                            backgroundColor: isDark ? 'var(--auth-border)' : '#e2e8f0', 
                                            zIndex: 0 
                                        }} />
                                        <div style={{
                                            backgroundColor: logicalOperator === 'OR' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                            color: logicalOperator === 'OR' ? '#d97706' : 'var(--brand)',
                                            border: `1px solid ${logicalOperator === 'OR' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
                                            padding: '2px 10px',
                                            borderRadius: '12px',
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            zIndex: 1,
                                            alignSelf: 'center',
                                            fontFamily: isDark ? "'Space Mono', monospace" : 'inherit'
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

