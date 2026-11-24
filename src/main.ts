/* Bootstraps the standalone Alert Console application.
	The browser loads this entry point from index.html. */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig);
