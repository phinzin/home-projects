// --- Interface Definitions (Định nghĩa kiểu dữ liệu) ---

export type TaskCategory = 'vehicle' | 'home' | 'appliance' | 'health' | 'other';

export interface Task {
    id: string;
    taskName: string;
    periodType: 'time' | 'mileage';
    periodValue: number;
    periodUnit: 'months' | 'days' | 'km';
    lastCompletedDate: number | null;
    lastCompletedValue: number | null;
    timestamp: number;
    category: TaskCategory;
    notes?: string;
    history: CompletionRecord[];
}

export interface CompletionRecord {
    completedAt: number;
    value?: number; // KM value if mileage-based
    notes?: string;
}

export interface Status {
    text: string;
    color: 'red' | 'yellow' | 'green' | 'gray';
    nextDue: string;
    progressPercent: number;
    daysRemaining?: number;
    kmRemaining?: number;
}

export interface ModalData {
    taskId: string;
    taskName: string;
    periodType: 'time' | 'mileage';
}

export interface TaskStats {
    total: number;
    overdue: number;
    dueSoon: number;
    onTrack: number;
    noData: number;
}

export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; icon: string; color: string }> = {
    vehicle: { label: 'Xe cộ', icon: '🚗', color: 'blue' },
    home: { label: 'Nhà cửa', icon: '🏠', color: 'green' },
    appliance: { label: 'Thiết bị', icon: '🔧', color: 'orange' },
    health: { label: 'Sức khỏe', icon: '💊', color: 'pink' },
    other: { label: 'Khác', icon: '📋', color: 'gray' }
};
