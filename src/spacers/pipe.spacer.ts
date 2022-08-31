import type { Pipe } from '@plugin/models/pipe.model';
import type { TSESTree } from '@typescript-eslint/utils';
import type { Interpolation } from '@plugin/models/interpolation.model';

export class PipeSpacer {
    constructor(private expectWhitespace: boolean) {}

    get checkRegExp(): RegExp {
        return this.expectWhitespace ? /[^\S\r\n]\|[^\S\r\n]/g : /\S\|\S/g
    }

    get startCheckRegExp(): RegExp {
        return this.expectWhitespace ? /[^\S\r\n]\|./g : /\S\|./g;
    }

    get endCheckRegExp(): RegExp {
        return this.expectWhitespace ? /.\|[^\S\r\n]/g : /.\|\S/g;
    }

    *getIncorrectLocations(node: Interpolation): Iterable<TSESTree.SourceLocation> {
        for (const pipe of this.extractPipes(node)) {
            if (!this.checkRegExp.test(pipe.value)) {
                if (!this.startCheckRegExp.test(pipe.value)) {
                    yield this.getAbsoluteLocation(node, pipe, 'start');
                }

                if (!this.endCheckRegExp.test(pipe.value)) {
                    yield this.getAbsoluteLocation(node, pipe, 'end');
                }
            }
        }
    }

    private *extractPipes(node: Interpolation): Iterable<Pipe> {
        for (let charIndex = 0; charIndex < node.value.length; charIndex++) {
            const prevChar = node.value.charAt(charIndex - 1);
            const char = node.value.charAt(charIndex);
            const nextChar = node.value.charAt(charIndex + 1);
            if (char === '|' && prevChar && nextChar && prevChar !== char && nextChar !== char) {
                yield { offset: charIndex, value: prevChar + char + nextChar };
            }
        }
    }

    private getAbsoluteLocation(node: Interpolation, pipe: Pipe, relativeLocation: 'start' | 'end'): TSESTree.SourceLocation {
        if (relativeLocation === 'start') {
            return {
                start: {
                    ...node.location.start,
                    column: node.location.start.column + pipe.offset - (this.expectWhitespace ? 0 : 1),
                },
                end: {
                    ...node.location.start,
                    column: node.location.start.column + pipe.offset,
                }
            };
        }

        return {
            start: {
                ...node.location.start,
                column: node.location.start.column + pipe.offset + 1,
            },
            end: {
                ...node.location.start,
                column: node.location.start.column + pipe.offset + 1 + (this.expectWhitespace ? 0 : 1),
            }
        }
    }
}
