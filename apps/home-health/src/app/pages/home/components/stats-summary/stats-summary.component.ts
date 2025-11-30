import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-summary.component.html'
})
export class StatsSummaryComponent {
  @Input() tasks: any[] = [];
  @Input() getNextDueDate!: any;
  @Input() getDaysRemaining!: any;
}
