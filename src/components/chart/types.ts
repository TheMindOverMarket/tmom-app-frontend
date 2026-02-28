export interface MarkerData {
    id: string;
    x: number;
    y: number;
    timestamp: number;
    type: 'adherence' | 'deviation';
}
