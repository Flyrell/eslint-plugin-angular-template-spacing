import type { TSESTree } from '@typescript-eslint/utils';
import type { Interpolation, IncompleteNode } from '@plugin/models/interpolation.model';

export function extractNodesFromInterpolationParent(program: TSESTree.Program & { value: string }): Interpolation[] {
    let line = 1;
    let column = 0;

    const nodes: Interpolation[] = [];
    let currentNode: IncompleteNode | undefined = undefined;
    for (const part of program.value.split('\n')) {
        const startIndex = part.indexOf('{{');
        const endIndex = part.indexOf('}}');
        const startIndexExists = startIndex !== -1;
        const endIndexExists = endIndex !== -1;

        if (!startIndexExists && !endIndexExists) {
            line += 1;
            column = 0;
            if (currentNode) currentNode.value += part + '\n';
            continue;
        }

        if (startIndexExists) {
            currentNode = {
                value: part.substring(startIndex, endIndexExists ? (endIndex + 2) : part.length),
                location: {
                    start: { line, column: startIndex },
                }
            };
        } else if (currentNode) {
            currentNode.value += part.substring(0, endIndex + 2);
        }

        if (endIndexExists && currentNode) {
            currentNode.location = {
                ...currentNode.location,
                end: { line, column: endIndex + 2 },
            };
            nodes.push(currentNode as Interpolation);
            currentNode = undefined;
        }

        line += 1;
        column = 0;
        if (currentNode) currentNode.value += '\n';
    }

    return nodes;
}
