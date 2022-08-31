import type { TSESTree } from '@typescript-eslint/utils';
import type { Interpolation, IncompleteNode } from '@plugin/models/interpolation.model';

/**
 * As compiler returns interpolations within the same parent as a single Interpolation object with children,
 * in order to get the positions and the actual "text" used to write an interpolation by iterating through the parent text.
 * While iterating, we can figure out what line and column the interpolation is on (as this is not provided as well).
 */
export function extractNodesFromInterpolationParent(program: TSESTree.Program & { value: string }): Interpolation[] {
    let line = 1;
    let column = 0;

    const nodes: Interpolation[] = [];
    let currentNode: IncompleteNode = undefined;
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
