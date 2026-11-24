import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { noWhitespaceOnlyValidator } from './no-whitespace-only.validator';

describe('noWhitespaceOnlyValidator', () => {
  it.each(['', '   ', '\t\n'])('rejects a note containing only whitespace (%j)', (value) => {
    expect(noWhitespaceOnlyValidator(new FormControl(value))).toEqual({ whitespaceOnly: true });
  });

  it('accepts a note containing non-whitespace characters', () => {
    expect(noWhitespaceOnlyValidator(new FormControl('  Restarted consumer  '))).toBeNull();
  });
});
