/* Rejects form values that contain only whitespace characters.
   ResolveAlertForm uses it alongside Angular's required validator. */
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noWhitespaceOnlyValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  return typeof value === 'string' && value.trim().length > 0 ? null : { whitespaceOnly: true };
};
