# Contributing to the Project

## Branch Conventions

- **main**: The main branch contains the production code.
- **develop**: The develop branch contains the latest development changes.
- **feature/\<feature-name\>**: Feature branches are used to develop new features.
- **bugfix/\<bug-name\>**: Bugfix branches are used to fix bugs.
- **hotfix/\<hotfix-name\>**: Hotfix branches are used for urgent fixes.

## Commit Message Conventions

We follow the [Angular commit message conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit).

### Commit Message Format

Each commit message consists of a header, a body, and a footer. The header has a special format that includes a type, a scope, and a subject:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing or correcting existing tests
- **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

The scope could be anything specifying the place of the commit change. For example `core`, `docs`, `runtime`, etc.

### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Body

Just as in the subject, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit closes.
