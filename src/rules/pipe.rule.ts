import { RuleValue } from '@plugin/models/options.model';
import { PipeSpacer } from '@plugin/spacers/pipe.spacer';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { PipeRuleOptions } from '@plugin/models/options.model';
import { extractNodesFromInterpolationParent } from '@plugin/utils/interpolation.utils';

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
        const expectWhitespace = options[0] === RuleValue.Always ?? true;

        const spacer = new PipeSpacer(expectWhitespace);

        return {
            Program(program: TSESTree.Program & { value: string }) {
                const nodes = extractNodesFromInterpolationParent(program);
                nodes.map(node => {
                    for (const location of spacer.getIncorrectLocations(node)) {
                        context.report({
                            loc: location,
                            messageId: expectWhitespace ? 'whitespaceMissing' : 'whitespaceExtra',
                        });
                    }
                });
            },
        };
    }
};

