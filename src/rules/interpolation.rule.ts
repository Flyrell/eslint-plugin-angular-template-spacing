import { RuleValue } from '@plugin/models/options.model';
import { isInlineTemplate } from '@plugin/utils/template.utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { InterpolationSpacer } from '@plugin/spacers/interpolation.spacer';
import type { InterpolationRuleOptions } from '@plugin/models/options.model';
import { covertToInterpolationNodes } from '@plugin/utils/interpolation.utils';
import type { BoundText, InterpolationNode } from '@plugin/models/interpolation.model';

function createReportWithoutLocation(
    context: Parameters<TSESLint.RuleModule<string>['create']>[0],
    node: BoundText,
    messageId: string,
): void {
    return context.report({ node: node as unknown as TSESTree.Node, messageId });
}

function createReport(
    context: Parameters<TSESLint.RuleModule<string>['create']>[0],
    node: InterpolationNode,
    messageId: string,
): (fix?: TSESLint.ReportFixFunction) => void {
    return fix => context.report({ loc: node.location, messageId, fix });
}

export const ruleName = 'interpolation';
export const ruleModule: TSESLint.RuleModule<string> = {
    meta: {
        type: 'suggestion',
        fixable: 'whitespace',
        schema: [
            {
                enum: ['always', 'never']
            },
            {
                type: 'object',
                properties: {
                    allowNewlines: {
                        default: true,
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        ],
        docs: {
            description: 'Checks interpolation whitespace in Angular templates',
            recommended: 'error',
        },
        messages: {
            whitespaceExtra: 'whitespace in interpolation',
            whitespaceMissing: 'missing whitespace in interpolation',
        },
    },
    create(context) {
        const { options } = context as unknown as { options: InterpolationRuleOptions };
        const expectWhitespace = (options?.[0] ?? RuleValue.Always) === RuleValue.Always;
        const { allowNewlines = true } = options?.[1] ?? {};

        const spacer = new InterpolationSpacer(expectWhitespace, allowNewlines);
        const isInlineTmpl = isInlineTemplate(context);
        const messageId = expectWhitespace ? 'whitespaceMissing' : 'whitespaceExtra';

        return {
            BoundText(boundText: BoundText & { parent: any }) {
                if (boundText.value?.ast?.type !== 'Interpolation') {
                    return;
                }

                for (const interpolationNode of covertToInterpolationNodes(boundText)) {
                    for (const node of spacer.getIncorrectNodesWithAbsoluteLocation(interpolationNode)) {
                        if (isInlineTmpl) {
                            createReportWithoutLocation(context, boundText, messageId);
                        } else {
                            createReport(context, node, messageId)(fixer => fixer.replaceTextRange(
                                expectWhitespace ? [node.offset, node.offset] : [node.offset, node.offset + 1],
                                expectWhitespace ? ' ' : '',
                            ));
                        }
                    }
                }
            },
        };
    }
};

