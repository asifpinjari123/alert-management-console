/* Displays an alert severity as readable text and a color chip.
   AlertTable and AlertDetailPanel use this presentation component. */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AlertSeverity } from '../../../core/models/alert.model';

@Component({
  selector: 'app-severity-chip',
  templateUrl: './severity-chip.component.html',
  styleUrl: './severity-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeverityChipComponent {
  readonly severity = input.required<AlertSeverity>();
}
