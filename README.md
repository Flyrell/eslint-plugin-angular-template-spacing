# eslint-plugin-angular-template-spacing

Plugin that offers spacing possibilities in Angular's templates using ESLint.
You can set the spacing rules around interpolation and pipes.

### Requirements
In order for this plugin to work, you have to have `@angular-eslint/eslint-plugin-template` installed.

### Installation

In order to install plugin in your repository run:
```bash
npm install --save-dev eslint-plugin-angular-template-spacing
```

## Usage

### Recommended rules

You can extend the recommended set of rules which ensures spaces in interpolation statements and pipes. 
```json
{
    "extends": [
      "plugin:angular-template-spacing/recommended"
    ]
}
```

Example of correct usage of recommended rules
```angular2html
<div>{{ 'My text' }}</div>
<div>{{ computedText | pipe }}</div>
<div>{{ numericVariable | pipe1 | pipe2 }}</div>
<div>{{ numericVariable | pipe:'pipe-arguments' }}</div>
<div>{{ numericVariable | pipe1:'pipe1-arguments' | pipe2:'pipe2-arguments' }}</div>
<my-component [a-directive]="value | pipe"></my-component>
```

### Specific rules

```json
{
  "rules": {
    "angular-template-spacing/pipes": ["off|warn|error", "always|never"],
    "angular-template-spacing/interpolation": ["off|warn|error", "always|never", { "acceptWhitespaces": true|false }]
  }
}
```
