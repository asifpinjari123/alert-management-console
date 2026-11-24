/* Renders alert rows and reports selection or filter-clear actions.
   AlertConsolePage supplies the already filtered and sorted rows. */
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Alert } from '../../../../core/models/alert.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SeverityChipComponent } from '../../../../shared/components/severity-chip/severity-chip.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-alert-table',
  imports: [DatePipe, EmptyStateComponent, SeverityChipComponent, StatusChipComponent],
  templateUrl: './alert-table.component.html',
  styleUrl: './alert-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertTableComponent {
  readonly alerts = input.required<Alert[]>();
  readonly selectedAlertId = input<string | null>(null);
  readonly alertSelected = output<string>();
  readonly clearFilters = output<void>();

  onRowKeydown(event: KeyboardEvent, alertId: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.alertSelected.emit(alertId);
    }
  }
}
