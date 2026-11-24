/* Root component for the Alert Console application.
  Phase 3 connects the feature page here. */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertConsolePageComponent } from './features/alert-console/alert-console.page';

@Component({
  selector: 'app-root',
  imports: [AlertConsolePageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
