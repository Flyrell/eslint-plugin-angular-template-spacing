import { BoundText } from '@plugin/models/interpolation.model';
import type { InterpolationNode, IncompleteInterpolationNode } from '@plugin/models/interpolation.model';

export function* covertToInterpolationNodes(boundText: BoundText): Iterable<InterpolationNode> {
    const source = boundText.value.source ?? '';
    let line = boundText.loc?.start?.line ?? 0;
    let column = boundText.loc?.start?.column ?? 0;
    let offset = boundText.sourceSpan?.start?.offset;
    // offset += source.length - source.trimStart().length;

    let currentNode: IncompleteInterpolationNode | undefined = undefined;
    for (const part of source.trim().split('\n')) {
        offset += part.length || 1;
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
                offset: offset - (part.length - startIndex),
                value: part.substring(startIndex, endIndexExists ? (endIndex + 2) : part.length),
                location: {
                    start: { line, column: column + startIndex },
                }
            };
        } else if (currentNode) {
            currentNode.value += part.substring(0, endIndex + 2);
        }

        if (endIndexExists && currentNode) {
            currentNode.location = {
                ...currentNode.location,
                end: { line, column: column + endIndex + 2 },
            };
            yield currentNode as InterpolationNode;
            currentNode = undefined;
        }

        line += 1;
        column = 0;
        offset += 1;
        if (currentNode) currentNode.value += '\n';
    }
}
