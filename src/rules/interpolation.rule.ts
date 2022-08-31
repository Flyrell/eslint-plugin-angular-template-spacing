import { RuleValue } from '@plugin/models/options.model';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { InterpolationSpacer } from '@plugin/spacers/interpolation.spacer';
import type { InterpolationRuleOptions } from '@plugin/models/options.model';
import { extractNodesFromInterpolationParent } from '@plugin/utils/interpolation.utils';

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
        const expectWhitespace = options[0] === RuleValue.Always ?? true;
        const { allowNewlines = true } = options[1] ?? {};

        const spacer = new InterpolationSpacer(expectWhitespace, allowNewlines);

        return {
            Program(program: TSESTree.Program & { value: string }) {
                const nodes = extractNodesFromInterpolationParent(program);
                nodes.forEach(node => {
                    for (const location of spacer.getIncorrectLocations(node)) {
                        context.report({
                            loc: location,
                            messageId: expectWhitespace ? 'whitespaceMissing' : 'whitespaceExtra',
                        });
                    }
                });
            }
        };
    }
};

