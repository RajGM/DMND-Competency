# Secret Gist Submission Instructions

`gh` (GitHub CLI) is not installed in this environment, so the gist could not be published automatically.

## Publish Manually

1. Install GitHub CLI: <https://cli.github.com/>
2. Authenticate:
   - `gh auth login`
3. Create a secret gist from the competency module:
   - `gh gist create submission/competency-gist-content.tsx --secret --desc "DMND competency test widget"`
4. Copy the returned gist URL into your Summer of Bitcoin proposal document.
