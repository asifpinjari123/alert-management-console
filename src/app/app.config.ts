/* Application-wide providers for the standalone Alert Console app.
  The root component receives this config during bootstrap. */
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
