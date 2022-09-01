import type { Pipe } from '@plugin/models/pipe.model';
import type { InterpolationNode } from '@plugin/models/interpolation.model';

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

    *getIncorrectNodesWithAbsoluteLocation(node: InterpolationNode): Iterable<InterpolationNode> {
        for (const pipe of this.extractPipes(node)) {
            if (!this.checkRegExp.test(pipe.value)) {
                if (!this.startCheckRegExp.test(pipe.value)) {
                    yield this.generateNodeWithAbsoluteLocation(node, pipe, 'start');
                }

                if (!this.endCheckRegExp.test(pipe.value)) {
                    yield this.generateNodeWithAbsoluteLocation(node, pipe, 'end');
                }
            }
        }
    }

    private *extractPipes(node: InterpolationNode): Iterable<Pipe> {
        for (let charIndex = 0; charIndex < node.value.length; charIndex++) {
            const prevChar = node.value.charAt(charIndex - 1);
            const char = node.value.charAt(charIndex);
            const nextChar = node.value.charAt(charIndex + 1);
            if (char === '|' && prevChar && nextChar && prevChar !== char && nextChar !== char) {
                yield { offset: charIndex, value: prevChar + char + nextChar };
            }
        }
    }

    private generateNodeWithAbsoluteLocation(node: InterpolationNode, pipe: Pipe, relativeLocation: 'start' | 'end'): InterpolationNode {
        const isAtStart = relativeLocation === 'start';
        let startColumn = node.location.start.column + pipe.offset + (isAtStart ? (this.expectWhitespace ? 0 : -1) : 1);
        let endColumn = node.location.start.column + pipe.offset + (isAtStart ? 0 : (this.expectWhitespace ? 0 : 2));

        return {
            ...node,
            offset: node.offset + pipe.offset + (isAtStart ? 0 : 1),
            location: {
                start: { ...node.location.start, column: startColumn },
                end: { ...node.location.start, column: endColumn },
            },
        };
    }
}
