# Bash commands
- `npm run check`: Run the typechecker.
- `npm run fmt`: Run the code formatter.

# Code style

- Use ES modules (import/export) syntax, not CommonJS (require).
- Always append a `.ts` ending to relative imports.
- Destructure imports when possible (eg. `import { foo } from 'bar'`).

# Workflow

- Never read files in slices. Instead, whenever accessing a file, you must read a file in its entirety.
- Be sure to typecheck when you're done making a series of code changes.
- Be sure to run the code formatter when you're done makeing a series of code changes.
