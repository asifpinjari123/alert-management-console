/* Root component for the Alert Console application.
  Composes the console page as the app's primary view. */
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
