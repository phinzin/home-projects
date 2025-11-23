// Mock data cho các công việc định kỳ trong gia đình
export interface Task {
  id: string;
  name: string;
  lastDone: string; // ISO date
  cycleDays: number; // số ngày giữa các lần thực hiện
  note?: string;
  // UI phụ trợ
  nextDue?: string;
  status?: 'upcoming' | 'normal' | 'overdue';
}

export const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Thay lõi lọc nước',
    lastDone: '2025-11-01',
    cycleDays: 180,
    note: 'Dùng lõi lọc mới của hãng A',
  },
  {
    id: '2',
    name: 'Bảo trì xe máy',
    lastDone: '2025-10-15',
    cycleDays: 90,
    note: 'Thay nhớt, kiểm tra lốp',
  },
  {
    id: '3',
    name: 'Chích ngừa mèo',
    lastDone: '2025-11-23',
    cycleDays: 365,
    note: 'Chích ngừa phòng bệnh dại',
  },
];
