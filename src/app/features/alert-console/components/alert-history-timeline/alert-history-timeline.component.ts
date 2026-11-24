/* Displays alert state changes in the order they occurred.
   AlertDetailPanel passes the selected alert's history entries. */
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AlertHistoryEntry } from '../../../../core/models/alert.model';
import { sortHistoryChronologically } from '../../alert-console.utils';

@Component({
  selector: 'app-alert-history-timeline',
  imports: [DatePipe],
  templateUrl: './alert-history-timeline.component.html',
  styleUrl: './alert-history-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertHistoryTimelineComponent {
  readonly history = input.required<AlertHistoryEntry[]>();
  readonly chronologicalHistory = computed(() => sortHistoryChronologically(this.history()));
}
