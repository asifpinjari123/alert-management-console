import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ResolveAlertFormComponent } from './resolve-alert-form.component';

describe('ResolveAlertFormComponent', () => {
  let fixture: ComponentFixture<ResolveAlertFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ResolveAlertFormComponent],
    });
    fixture = TestBed.createComponent(ResolveAlertFormComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows an inline error when an empty note is submitted', () => {
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#resolution-note-error').textContent).toContain(
      'Add a resolution note.',
    );
  });

  it('shows whitespace validation and updates the character count while typing', () => {
    const input = fixture.nativeElement.querySelector('#resolution-note') as HTMLInputElement;
    input.value = '   ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#resolution-note-error').textContent).toContain(
      'only whitespace',
    );
    expect(fixture.nativeElement.querySelector('#resolution-note-count').textContent).toContain(
      '3 characters',
    );
  });

  it('emits a trimmed note for a valid submission', () => {
    const emittedNotes: string[] = [];
    fixture.componentInstance.resolve.subscribe((note) => emittedNotes.push(note));
    const input = fixture.nativeElement.querySelector('#resolution-note') as HTMLInputElement;
    input.value = '  Restarted consumer  ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[type="submit"]').click();

    expect(emittedNotes).toEqual(['Restarted consumer']);
  });

  it('disables resolve and cancel actions while saving', () => {
    fixture.componentRef.setInput('isSaving', true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
  });

  it('displays the service error inline so the user can retry', () => {
    fixture.componentRef.setInput('errorMessage', 'Could not resolve alert AL-001.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Could not resolve alert AL-001.');
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
  });
});
