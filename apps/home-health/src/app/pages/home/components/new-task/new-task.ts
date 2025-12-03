import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from 'apps/home-health/src/app/models/maintenance-tracker.model';

@Component({
  selector: 'app-new-task',
  imports: [CommonModule],
  templateUrl: './new-task.html',
  styleUrl: './new-task.scss',
})
export class NewTask {

  isMileageType = signal(false);

  // --- UI Utility Methods ---

    updatePeriodUnit(type: string) {
        this.isMileageType.set(type === 'mileage');
    }

    getTodayDateString(): string {
        return new Date().toISOString().split('T')[0];
    }

    getPeriodText(task: Task): string {
        return task.periodType === 'time'
            ? `Định kỳ: ${task.periodValue} ${task.periodUnit === 'months' ? 'Tháng' : 'Ngày'}`
            : `Định kỳ: ${task.periodValue} KM`;
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

    getCardClasses(color: string): string {
        const colorMap: { [key: string]: string } = {
            red: 'border-red-500 bg-red-500/10',
            yellow: 'border-yellow-500 bg-yellow-500/10',
            green: 'border-green-500 bg-green-500/10',
            gray: 'border-gray-500 bg-gray-50'
        };
        return colorMap[color] || 'border-gray-500 bg-gray-50';
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

    updateTask(event: Event){
      event.preventDefault();
      console.log('Task updated');
    }

    addTask(event: Event) {
        event.preventDefault();
        console.log('Add task form submitted');
        // const form = event.target as HTMLFormElement;
        // const taskNameInput = form.querySelector('#taskName') as HTMLInputElement;
        // const periodTypeInput = form.querySelector('#periodType') as HTMLSelectElement;
        // const periodValueInput = form.querySelector('#periodValue') as HTMLInputElement;
        // const periodUnitInput = form.querySelector('#periodUnit') as HTMLSelectElement;

        // if (!this.db || !this.userId()) {
        //     console.error("Firebase not ready.");
        //     return;
        // }

        // const taskName = taskNameInput.value.trim();
        // const periodType = periodTypeInput.value as 'time' | 'mileage';
        // const periodValue = parseInt(periodValueInput.value);
        // const periodUnit = periodUnitInput.value as 'months' | 'days' | 'km';

        // if (!taskName || isNaN(periodValue) || periodValue <= 0) return;

        // const now = Date.now();

        // const taskData: Omit<Task, 'id'> = {
        //     taskName,
        //     periodType,
        //     periodValue,
        //     periodUnit,
        //     // For time-based, use current timestamp. For mileage, use 0 and prompt for update.
        //     lastCompletedDate: periodType === 'time' ? now : null,
        //     lastCompletedValue: periodType === 'mileage' ? 0 : null,
        //     timestamp: now,
        // };

        // const path = `artifacts/${appId}/users/${this.userId()}/maintenance_tasks`;
        // const docRef = doc(collection(this.db, path));

        // setDoc(docRef, taskData)
        //     .then(() => {
        //         form.reset();
        //         this.isMileageType.set(false); // Reset unit display
        //         if (periodType === 'mileage') {
        //             this.showInfoModal("Lưu ý về KM", "Công việc dựa trên KM đã được thêm. Vui lòng cập nhật Số KM (ODO) Hiện Tại của xe bạn để tính toán chính xác!");
        //         }
        //     })
        //     .catch(e => {
        //         console.error("Error adding document to Firestore:", e);
        //         this.showInfoModal("Lỗi", "Lỗi khi lưu công việc. Vui lòng kiểm tra console.");
        //     });
    }

}
