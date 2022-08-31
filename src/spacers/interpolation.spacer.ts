import type { TSESTree } from '@typescript-eslint/utils';
import type { Interpolation } from '@plugin/models/interpolation.model';

export class InterpolationSpacer {
    constructor(private expectWhitespace: boolean, private allowNewlines: boolean) {}

    get delimiter(): string {
        return this.allowNewlines ? '\\s' : '[^\\S\\r\\n]';
    }

    get checkRegExp(): RegExp {
        return this.expectWhitespace
            ? new RegExp(`\{\{${this.delimiter}[^}]*${this.delimiter}}}`, 'g')
            : /\{\{\S[^}]*\S}}/g;
    }

    get startCheckRegExp(): RegExp {
        return this.expectWhitespace ? new RegExp(`\{\{${this.delimiter}[^}]*}}`, 'g') : /\{\{\S[^}]*}}/g;
    }

    get endCheckRegExp(): RegExp {
        return this.expectWhitespace ? new RegExp(`\{\{[^}]*${this.delimiter}}}`, 'g') : /\{\{[^}]*\S}}/g;
    }

    *getIncorrectLocations(node: Interpolation): Iterable<TSESTree.SourceLocation> {
        if (!this.checkRegExp.test(node.value)) {
            if (!this.startCheckRegExp.test(node.value)) {
                yield this.getAbsoluteLocation(node, 'start');
            }

            if (!this.endCheckRegExp.test(node.value)) {
                yield this.getAbsoluteLocation(node, 'end');
            }
        }
    }

    private getAbsoluteLocation(node: Interpolation, relativeLocation: 'start' | 'end'): TSESTree.SourceLocation {
        const interpolationLength = 2;

        if (relativeLocation === 'start') {
            return {
                start: {
                    ...node.location.start,
                    column: node.location.start.column + interpolationLength,
                },
                end: {
                    ...node.location.start,
                    column: node.location.start.column + interpolationLength + (this.expectWhitespace ? 0 : 1),
                }
            };
        }

        return {
            start: {
                ...node.location.end,
                column: node.location.end.column - interpolationLength - (this.expectWhitespace ? 0 : 1),
            },
            end: {
                ...node.location.end,
                column: node.location.end.column - interpolationLength,
            }
        }
    }
}
