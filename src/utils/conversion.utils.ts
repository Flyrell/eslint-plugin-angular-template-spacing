import type { TSESTree } from '@typescript-eslint/utils';
import type { ParseSourceSpan } from '@angular/compiler';

export function convertToLocation(span: ParseSourceSpan): TSESTree.SourceLocation {
    return {
        start: {
            column: span.start.col,
            line: span.start.line + 1,
        },
        end: {
            column: span.end.col,
            line: span.end.line + 1,
        },
    };
}
