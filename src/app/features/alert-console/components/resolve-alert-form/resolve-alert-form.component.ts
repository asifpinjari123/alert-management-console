/* Collects and validates the note required to resolve an alert.
   AlertDetailPanel supplies save state and handles the emitted note. */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { noWhitespaceOnlyValidator } from '../../../../shared/validators/no-whitespace-only.validator';

@Component({
  selector: 'app-resolve-alert-form',
  imports: [ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './resolve-alert-form.component.html',
  styleUrl: './resolve-alert-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResolveAlertFormComponent {
  readonly isSaving = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly resolve = output<string>();
  readonly cancel = output<void>();

  protected readonly noteControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, noWhitespaceOnlyValidator],
  });
  protected readonly form = new FormGroup({ note: this.noteControl });

  submitResolution(): void {
    // Keep programmatic submissions subject to the same saving and validation guards as the UI.
    if (this.isSaving()) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.resolve.emit(this.noteControl.value.trim());
  }
}
