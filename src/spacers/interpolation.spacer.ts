import type { InterpolationNode } from '@plugin/models/interpolation.model';

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

    *getIncorrectNodesWithAbsoluteLocation(node: InterpolationNode): Iterable<InterpolationNode> {
        if (!this.checkRegExp.test(node.value)) {
            if (!this.startCheckRegExp.test(node.value)) {
                yield this.generateNodeWithAbsoluteLocation(node, 'start');
            }

            if (!this.endCheckRegExp.test(node.value)) {
                yield this.generateNodeWithAbsoluteLocation(node, 'end');
            }
        }
    }

    private generateNodeWithAbsoluteLocation(node: InterpolationNode, relativeLocation: 'start' | 'end'): InterpolationNode {
        const interpolationLength = 2;

        if (relativeLocation === 'start') {
            return {
                ...node,
                offset: node.offset + interpolationLength,
                location: {
                    start: {
                        ...node.location.start,
                        column: node.location.start.column + interpolationLength,
                    },
                    end: {
                        ...node.location.start,
                        column: node.location.start.column + interpolationLength + (this.expectWhitespace ? 0 : 1),
                    },
                },
            };
        }

        return {
            ...node,
            offset: node.offset + node.value.length - interpolationLength,
            location: {
                start: {
                    ...node.location.end,
                    column: node.location.end.column - interpolationLength - (this.expectWhitespace ? 0 : 1),
                },
                end: {
                    ...node.location.end,
                    column: node.location.end.column - interpolationLength,
                },
            },
        }
    }
}
