import * as pipe from '@plugin/rules/pipe.rule';
import recommended from '@plugin/configs/recommended.json';
import * as interpolation from '@plugin/rules/interpolation.rule';

export default {
    configs: {
        recommended
    },
    rules: {
        [pipe.ruleName]: pipe.ruleModule,
        [interpolation.ruleName]: interpolation.ruleModule,
    },
}
