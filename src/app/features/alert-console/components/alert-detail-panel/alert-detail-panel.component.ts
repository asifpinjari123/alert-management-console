/* Shows selected alert metadata, its timeline, and resolution controls.
   AlertConsolePage provides the alert and handles emitted user actions. */
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Alert } from '../../../../core/models/alert.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { SeverityChipComponent } from '../../../../shared/components/severity-chip/severity-chip.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';
import { isResolvable } from '../../alert-console.utils';
import { AlertHistoryTimelineComponent } from '../alert-history-timeline/alert-history-timeline.component';
import { ResolveAlertFormComponent } from '../resolve-alert-form/resolve-alert-form.component';

@Component({
  selector: 'app-alert-detail-panel',
  imports: [
    DatePipe,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    SeverityChipComponent,
    StatusChipComponent,
    AlertHistoryTimelineComponent,
    ResolveAlertFormComponent,
  ],
  templateUrl: './alert-detail-panel.component.html',
  styleUrl: './alert-detail-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertDetailPanelComponent {
  readonly alert = input<Alert | null>(null);
  readonly isSaving = input(false);
  readonly showResolveForm = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly openResolve = output<void>();
  readonly closeResolve = output<void>();
  readonly resolve = output<string>();

  protected readonly isResolvable = isResolvable;
}
