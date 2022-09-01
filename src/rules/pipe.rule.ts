import { RuleValue } from '@plugin/models/options.model';
import { PipeSpacer } from '@plugin/spacers/pipe.spacer';
import type { TSESLint } from '@typescript-eslint/utils';
import type { BoundAttribute } from '@plugin/models/pipe.model';
import type { PipeRuleOptions } from '@plugin/models/options.model';
import { convertSpanToLocation } from '@plugin/utils/conversion.utils';
import { covertToInterpolationNodes } from '@plugin/utils/interpolation.utils';
import type { BoundText, InterpolationNode } from '@plugin/models/interpolation.model';

function createReport(
    context: Parameters<TSESLint.RuleModule<string>['create']>[0],
    node: InterpolationNode,
    messageId: string,
): (fix?: TSESLint.ReportFixFunction) => void {
    return fix => context.report({ loc: node.location, messageId, fix });
}

export const ruleName = 'pipe';
export const ruleModule: TSESLint.RuleModule<string> = {
    meta: {
        type: 'suggestion',
        fixable: 'whitespace',
        schema: [
            {
                enum: ['always', 'never']
            }
        ],
        docs: {
            description: 'Checks pipe whitespace in Angular templates',
            recommended: 'error',
        },
        messages: {
            whitespaceExtra: 'whitespace around pipe',
            whitespaceMissing: 'missing whitespace around pipe',
        },
    },
    create(context) {
        const { options } = context as unknown as { options: PipeRuleOptions };
        const expectWhitespace = (options?.[0] ?? RuleValue.Always) === RuleValue.Always;

        const spacer = new PipeSpacer(expectWhitespace);

        return {
            BoundText(boundText: BoundText) {
                if (boundText.value?.ast?.type !== 'Interpolation') {
                    return;
                }

                for (const interpolationNode of covertToInterpolationNodes(boundText)) {
                    for (const node of spacer.getIncorrectNodesWithAbsoluteLocation(interpolationNode)) {
                        createReport(context, node, expectWhitespace ? 'whitespaceMissing' : 'whitespaceExtra')(
                            fixer => fixer.replaceTextRange(
                                expectWhitespace ? [node.offset, node.offset] : [node.offset, node.offset + 1],
                                expectWhitespace ? ' ' : '',
                            ),
                        );
                    }
                }
            },
            BoundAttribute({ value, valueSpan }: BoundAttribute): void {
                const interpolationNode: InterpolationNode = {
                    value: value.source ?? '',
                    offset: valueSpan.start.offset,
                    location: convertSpanToLocation(valueSpan),
                };

                for (const node of spacer.getIncorrectNodesWithAbsoluteLocation(interpolationNode)) {
                    createReport(context, node, expectWhitespace ? 'whitespaceMissing' : 'whitespaceExtra')(
                        fixer => fixer.replaceTextRange(
                            expectWhitespace ? [node.offset, node.offset] : [node.offset, node.offset + 1],
                            expectWhitespace ? ' ' : '',
                        ),
                    );
                }
            }
        };
    }
};

