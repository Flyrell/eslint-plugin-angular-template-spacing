import { RuleValue } from '@plugin/models/options.model';
import { PipeSpacer } from '@plugin/spacers/pipe.spacer';
import { convertToLocation } from '@plugin/utils/conversion.utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { PipeRuleOptions } from '@plugin/models/options.model';
import type { ASTWithSource, ParseSourceSpan } from '@angular/compiler';
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
            whitespaceExtra2: '222 whitespace around pipe',
            whitespaceMissing2: '222 missing whitespace around pipe',
        },
    },
    create(context) {
        const { options } = context as unknown as { options: PipeRuleOptions };
        const expectWhitespace = options[0] === RuleValue.Always ?? true;

        const spacer = new PipeSpacer(expectWhitespace);

        return {
            Program(program: TSESTree.Program): void {
                const nodes = extractNodesFromInterpolationParent(program as TSESTree.Program & { value: string });
                nodes.map(node => {
                    for (const location of spacer.getIncorrectLocations(node)) {
                        context.report({
                            loc: location,
                            messageId: expectWhitespace ? 'whitespaceMissing' : 'whitespaceExtra',
                        });
                    }
                });
            },
            BoundAttribute({ value, valueSpan }: { value: ASTWithSource, valueSpan: ParseSourceSpan }): void {
                const locations = spacer.getIncorrectLocations({ value: value.source ?? '', location: convertToLocation(valueSpan) });
                for (const location of locations) {
                    context.report({
                        loc: location,
                        messageId: expectWhitespace ? 'whitespaceMissing2' : 'whitespaceExtra2',
                    });
                }
            }
        };
    }
};

