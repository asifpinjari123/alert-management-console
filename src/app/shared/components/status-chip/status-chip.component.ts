/* Displays an alert status as a readable label and chip.
   AlertTable and AlertDetailPanel use this presentation component. */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AlertStatus } from '../../../core/models/alert.model';

@Component({
  selector: 'app-status-chip',
  imports: [],
  templateUrl: './status-chip.component.html',
  styleUrl: './status-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  readonly status = input.required<AlertStatus>();
}
