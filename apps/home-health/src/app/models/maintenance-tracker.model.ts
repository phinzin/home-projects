// --- Interface Definitions (Định nghĩa kiểu dữ liệu) ---
export interface Task {
    id: string;
    taskName: string;
    periodType: 'time' | 'mileage'; // 'time' or 'mileage'
    periodValue: number; // e.g., 3 (months) or 5000 (km)
    periodUnit: 'months' | 'days' | 'km';
    lastCompletedDate: number | null; // Timestamp for time-based tasks
    lastCompletedValue: number | null; // KM for mileage-based tasks
    timestamp: number;
}

export interface Status {
    text: string;
    color: string;
    nextDue: string;
    progressPercent: number; // 0 to 100
}

// Corresponds to the ModalData interface in modal-data.ts
export interface ModalData {
    taskId: string;
    taskName: string;
    periodType: 'time' | 'mileage';
}