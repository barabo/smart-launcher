# New Contributor

Thank you for contributing to this project!

## Current Work - Feature Branches

Currently all active work on new features is being done in the `v2` and `v3`
branches.

Please consider which of these is more appropriate for you!

## Getting Started

### Dependencies

Please consider using `nvm` to manage multiple installations of node on your
machine.

```bash
nvm use 16  # select node v16
npm ci      # install the launcher dependencies
```

### First Things First

After installing dependencies, it's a good idea to make sure the tests pass.

```bash
npm test
```

### Configuration

Before doing development work, you need to define some environment variables
and make them available to your process.  You must create a file in the root
directory called `.env` and include at least the following content:

```bash
FHIR_SERVER_R2="https://r2.smarthealthit.org"
FHIR_SERVER_R3="https://r3.smarthealthit.org"
FHIR_SERVER_R4="https://r4.smarthealthit.org"
PICKER_CONFIG_R2="r2"
PICKER_CONFIG_R3="r3"
PICKER_CONFIG_R4="r4"
```

## Code of Conduct

This project has adopted the
[Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.
Contact [TBD](mailto:tbd@tbd.org) with any questions or concerns over conduct
you have observed.

## Testing, Linting, and Style

All code must be covered by unit tests.  For that, we use the mocha testing
library.

Please lint your code before creating your pull requests!

Where possible, please try to match the style of the existing code for
consistency.

## Submitting Your Contributions

Please fork this repo and send your pull requests back when ready.

## Future Intentions

The current codebase consists mostly of JavaScript, but the authors would like
to migrate to TypeScript in a future release.
