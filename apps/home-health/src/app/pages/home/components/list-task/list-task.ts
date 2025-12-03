import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Status, Task } from 'apps/home-health/src/app/models/maintenance-tracker.model';

@Component({
  selector: 'app-list-task',
  imports: [CommonModule],
  templateUrl: './list-task.html',
  styleUrl: './list-task.scss',
})
export class ListTask {

  tasks = signal<Task[]>([]);

  // State for Mileage tracking
  currentOdo = signal<number>(0); 

  deleteTask(taskId: string) {
        // if (!this.db || !this.userId()) return;
        
        // if (window.confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
        //     const docRef = doc(this.db, `artifacts/${appId}/users/${this.userId()}/maintenance_tasks`, taskId);
        //     deleteDoc(docRef).catch(error => {
        //         console.error("Error deleting task:", error);
        //         this.showInfoModal("Lỗi", "Lỗi khi xóa công việc. Vui lòng kiểm tra console.");
        //     });
        // }
        console.log(`Task with ID ${taskId} deleted`);
  }

  // --- Modal Logic ---

    openUpdateModal(task: Task & { status: Status }) {
        // this.modalTaskId = task.id;
        // this.aiAdvice.set(null); // Reset AI advice
        // this.modalData.set({
        //     taskId: task.id,
        //     taskName: task.taskName,
        //     periodType: task.periodType
        // });
        // this.modalOpen.set(true);
    }

    closeUpdateModal() {
        // this.modalOpen.set(false);
        // this.aiAdvice.set(null); // Reset AI advice
    }

    getBadgeClasses(color: string): string {
        const colorMap: { [key: string]: string } = {
            red: 'bg-red-500',
            yellow: 'bg-yellow-500',
            green: 'bg-green-500',
            gray: 'bg-gray-500'
        };
        return colorMap[color] || 'bg-gray-500';
    }

    getProgressBarClasses(color: string): string {
        const colorMap: { [key: string]: string } = {
            red: 'bg-red-500',
            yellow: 'bg-yellow-500',
            green: 'bg-green-500',
            gray: 'bg-gray-400'
        };
        return colorMap[color] || 'bg-gray-400';
    }

    getLastValueText(task: Task): string {
        if (task.periodType === 'time' && task.lastCompletedDate) {
            return `Lần cuối: ${new Date(task.lastCompletedDate).toLocaleDateString('vi-VN')}`;
        }
        if (task.periodType === 'mileage' && task.lastCompletedValue !== null) {
            return `Lần cuối: ${task.lastCompletedValue} KM`;
        }
        return 'Lần cuối: Chưa có dữ liệu';
    }

    getPeriodText(task: Task): string {
        return task.periodType === 'time'
            ? `Định kỳ: ${task.periodValue} ${task.periodUnit === 'months' ? 'Tháng' : 'Ngày'}`
            : `Định kỳ: ${task.periodValue} KM`;
    }

    // Tính toán lại trạng thái của tất cả các task khi có thay đổi
    tasksWithStatus = computed(() => {
        const currentOdoValue = this.currentOdo();
        // Sort by progress percent descending (most urgent first)
        return this.tasks()
            .map(task => ({
                ...task,
                status: this.calculateStatus(task, currentOdoValue)
            }))
            .sort((a, b) => b.status.progressPercent - a.status.progressPercent); 
    });

    private calculateStatus(task: Task, currentOdo: number): Status {
        let status: Status = { text: 'Chưa rõ', color: 'gray', nextDue: 'N/A', progressPercent: 0 };

        if (task.periodType === 'time' && task.lastCompletedDate !== null) {
            const lastDate = new Date(task.lastCompletedDate);
            let nextDueDate = new Date(lastDate);

            // Calculate next due date
            if (task.periodUnit === 'months') {
                nextDueDate.setMonth(nextDueDate.getMonth() + task.periodValue);
            } else if (task.periodUnit === 'days') {
                nextDueDate.setDate(nextDueDate.getDate() + task.periodValue);
            }

            const now = Date.now();
            const totalTime = nextDueDate.getTime() - lastDate.getTime();
            const elapsedTime = now - lastDate.getTime();
            const diffTime = nextDueDate.getTime() - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            status.nextDue = nextDueDate.toLocaleDateString('vi-VN');

            // Calculate Progress
            status.progressPercent = Math.min(100, (elapsedTime / totalTime) * 100);

            if (diffTime <= 0) {
                status.text = 'QUÁ HẠN!';
                status.color = 'red';
                status.progressPercent = 100;
            } else if (diffDays <= 14) {
                status.text = `Sắp đến hạn (${diffDays} ngày)`;
                status.color = 'yellow';
            } else {
                status.text = `Còn ${diffDays} ngày`;
                status.color = 'green';
            }
        } else if (task.periodType === 'mileage' && task.lastCompletedValue !== null) {
            const nextMileage = task.lastCompletedValue + task.periodValue;
            const mileageUsed = currentOdo - task.lastCompletedValue;
            const mileageRemaining = nextMileage - currentOdo;
            
            // Calculate Progress
            status.progressPercent = Math.min(100, (mileageUsed / task.periodValue) * 100);

            status.nextDue = `${nextMileage} KM`;

            if (currentOdo === 0 && task.lastCompletedValue === 0) {
                 status.text = 'Cần cập nhật KM ban đầu!';
                 status.color = 'gray';
                 status.progressPercent = 0;
            } else if (currentOdo >= nextMileage) {
                status.text = 'QUÁ HẠN KM!';
                status.color = 'red';
                status.progressPercent = 100;
            } else if (mileageRemaining <= 500) { // Warning within 500 KM
                status.text = `Sắp đến hạn (${mileageRemaining} KM còn lại)`;
                status.color = 'yellow';
            } else {
                status.text = `Còn ${mileageRemaining} KM`;
                status.color = 'green';
            }
        }
        return status;
    }

    getCardClasses(color: string): string {
        const colorMap: { [key: string]: string } = {
            red: 'border-red-500 bg-red-500/10',
            yellow: 'border-yellow-500 bg-yellow-500/10',
            green: 'border-green-500 bg-green-500/10',
            gray: 'border-gray-500 bg-gray-50'
        };
        return colorMap[color] || 'border-gray-500 bg-gray-50';
    }
    
}
