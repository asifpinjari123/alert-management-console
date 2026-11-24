/* Displays the three alert filters and the current result count.
   AlertConsolePage supplies values and handles emitted filter changes. */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  ALL_FILTER_VALUE,
  AlertSeverity,
  AlertSource,
  AlertStatus,
  SEVERITIES,
  SOURCES,
  STATUSES,
} from '../../../../core/models/alert.model';
import { AlertFilters } from '../../alert-console.utils';

@Component({
  selector: 'app-alert-filter-bar',
  imports: [],
  templateUrl: './alert-filter-bar.component.html',
  styleUrl: './alert-filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertFilterBarComponent {
  readonly filters = input.required<AlertFilters>();
  readonly filteredCount = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly hasActiveFilters = input.required<boolean>();

  readonly statusChange = output<AlertStatus | typeof ALL_FILTER_VALUE>();
  readonly severityChange = output<AlertSeverity | typeof ALL_FILTER_VALUE>();
  readonly sourceChange = output<AlertSource | typeof ALL_FILTER_VALUE>();
  readonly clearFilters = output<void>();

  protected readonly statuses = STATUSES;
  protected readonly severities = SEVERITIES;
  protected readonly sources = SOURCES;
  protected readonly allFilterValue = ALL_FILTER_VALUE;

  onStatusChange(value: string): void {
    this.statusChange.emit(STATUSES.find((status) => status === value) ?? ALL_FILTER_VALUE);
  }

  onSeverityChange(value: string): void {
    this.severityChange.emit(SEVERITIES.find((severity) => severity === value) ?? ALL_FILTER_VALUE);
  }

  onSourceChange(value: string): void {
    this.sourceChange.emit(SOURCES.find((source) => source === value) ?? ALL_FILTER_VALUE);
  }
}
