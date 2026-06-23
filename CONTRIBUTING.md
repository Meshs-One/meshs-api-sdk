# Contributing to MeshsOne

Thanks for your interest in contributing! 🚀

## Ways to Contribute

| What | Example |
|:---|:---|
| **Bug reports** | API returning unexpected responses, SDK throwing errors |
| **Feature requests** | Support for new models, new SDK methods |
| **Docs improvements** | Typos, unclear examples, missing use cases |
| **Code contributions** | Bug fixes, new features, tests |

## Before You Start

### For Bugs

1. Search [existing issues](https://github.com/Meshs-One/meshs-api-sdk/issues) first
2. Include: Node.js version, SDK version, minimal code to reproduce, expected vs actual output
3. Use the Bug Report template

### For Features

1. Open a Discussion or Issue with `[Feature Request]` in the title
2. Describe the problem you're solving (not just the solution)
3. Include example usage code

## Development Setup

```bash
git clone https://github.com/Meshs-One/meshs-api-sdk.git
cd meshs-api-sdk
npm install
npm test
```

## Pull Request Process

1. Fork the repo and create a branch: `feat/some-feature` or `fix/some-bug`
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Update README if needed
5. Open a PR against `main`
6. Link any related issues

## Style Guide

- JavaScript, ES2020+
- Use `async/await` over raw Promises
- Error messages should be descriptive and actionable
- Keep the zero-dependency philosophy — justify any new dependency

## Code of Conduct

Be respectful. Be constructive. This is a project for developers, by developers.

## Questions?

- Open a [Discussion](https://github.com/Meshs-One/meshs-api-sdk/discussions)
- Email: meshs.one@outlook.com

---

**First-time contributor?** Look for issues tagged `good first issue` — we'll help you through your first PR.
