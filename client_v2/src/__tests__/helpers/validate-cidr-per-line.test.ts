import { describe, it, expect, vi } from 'vitest';

vi.mock('panel/common/intl', () => ({
    default: {
        getMessage: vi.fn((key: string, values?: Record<string, unknown>) => {
            if (values?.line !== undefined) return `${key}:${values.line}`;
            if (values?.lines !== undefined) return `${key}:${values.lines}`;
            return key;
        }),
    },
}));

import { validateCidrPerLine } from 'panel/helpers/validators';

describe('validateCidrPerLine', () => {
    it('accepts empty input', () => {
        expect(validateCidrPerLine('')).toBeUndefined();
    });

    it('accepts IPv4 and IPv6 CIDR lines', () => {
        expect(validateCidrPerLine('10.0.0.0/8\n::1/128')).toBeUndefined();
    });

    it('rejects non-CIDR lines', () => {
        expect(validateCidrPerLine('not-a-cidr')).toBe('form_error_format');
    });

    it('rejects ClientID-looking lines', () => {
        expect(validateCidrPerLine('my-client-id')).toBe('form_error_format');
    });
});
