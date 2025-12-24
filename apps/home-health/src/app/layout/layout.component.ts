import { Component, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../components/toast/toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, ToastComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private platformId = inject(PLATFORM_ID);

  isDarkMode = signal(false);
  currentYear = new Date().getFullYear();

  constructor() {
    // Only access browser APIs in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Load dark mode preference from localStorage
      const savedMode = localStorage.getItem('home-health-dark-mode');
      if (savedMode !== null) {
        this.isDarkMode.set(savedMode === 'true');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkMode.set(prefersDark);
      }

      // Apply dark mode class to document
      effect(() => {
        const isDark = this.isDarkMode();
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('home-health-dark-mode', String(isDark));
      });
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode.update(v => !v);
  }
}
