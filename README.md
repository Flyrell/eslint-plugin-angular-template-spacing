# eslint-plugin-angular-template-spacing

Plugin that offers spacing possibilities in Angular's templates using ESLint.
You can set the spacing rules around interpolation and pipes.

### Requirements
In order for this plugin to work,
you have to have the peer dependencies installed:
- `@angular-eslint/eslint-plugin-template` `>= v12.0.0`
- `@angular-eslint/tempalte-parser` `>= 12.0.0`
- `@angular/complier` `>= 12.0.0`
- `eslint` `^8.0.0`

### Installation

In order to install plugin in your repository run:
```bash
npm install --save-dev eslint-plugin-angular-template-spacing
```

## Usage

Add plugin to the array of plugins for eslint
```json
{
  "plugins": [
    "angular-template-spacing" 
  ]
}
```

Add the rules:

#### Recommended rules

You can extend the recommended set of rules which ensures spaces in interpolation statements and pipes. 
```json
{
    "extends": [
      "plugin:angular-template-spacing/recommended"
    ]
}
```

Example of correct usage of recommended rules
```html
<div>{{ 'My text' }}</div>
<div>{{ computedText | pipe }}</div>
<div>{{ numericVariable | pipe1 | pipe2 }}</div>
<div>{{ numericVariable | pipe:'pipe-arguments' }}</div>
<div>{{ numericVariable | pipe1:'pipe1-arguments' | pipe2:'pipe2-arguments' }}</div>
<my-component [a-directive]="value | pipe"></my-component>
```

#### Specific rules

Or add the specific rules yourself

```json5
{
  "rules": {
    // Checks the spacing before and after the pipe
    // "always" => "value | pipe"
    // "never" => "value|pipe"
    "angular-template-spacing/pipes": ["off|warn|error", "always|never"],

    // Checks the spacing at the begging and at the end of interpolation
    // "always": "{{ value }}"
    // "never": "{{value}}"
    // "always" with "acceptWhitespaces: true":
    //    "{{
    //        example
    //     }}"
    "angular-template-spacing/interpolation": ["off|warn|error", "always|never", { "acceptWhitespaces": true|false }]
  }
}
```
