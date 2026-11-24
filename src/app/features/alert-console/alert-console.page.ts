/* Connects store signals and actions to the alert console components.
   This is the only page component that coordinates feature state. */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AlertConsoleStore } from './alert-console.store';
import { AlertDetailPanelComponent } from './components/alert-detail-panel/alert-detail-panel.component';
import { AlertFilterBarComponent } from './components/alert-filter-bar/alert-filter-bar.component';
import { AlertTableComponent } from './components/alert-table/alert-table.component';

@Component({
  selector: 'app-alert-console-page',
  imports: [AlertFilterBarComponent, AlertTableComponent, AlertDetailPanelComponent],
  templateUrl: './alert-console.page.html',
  styleUrl: './alert-console.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertConsolePageComponent {
  // STATE
  readonly store = inject(AlertConsoleStore);

  // ACTIONS
  onResolve(note: string): void {
    const alert = this.store.selectedAlert();
    if (!alert) {
      return;
    }

    void this.store.resolveAlert(alert.id, note).catch(() => undefined);
  }
}
