# Commit identity

All commits in this repository must be authored as **David Su &lt;dtscraft@gmail.com&gt;**.

We intentionally do **not** set `user.email` in git config. Identity is applied per commit.

## Recommended: npm script

```bash
git add .
npm run git:commit -- -m "Add feature X"
```

With staged changes and flags:

```bash
npm run git:commit -- -a -m "Fix typo in README"
```

Multi-line message:

```bash
npm run git:commit -- <<'EOF'
Add commit email enforcement.

Document wrapper script and agent rules.
EOF
```

## Alternative: environment variables

```bash
GIT_AUTHOR_NAME="David Su" \
GIT_AUTHOR_EMAIL="dtscraft@gmail.com" \
GIT_COMMITTER_NAME="David Su" \
GIT_COMMITTER_EMAIL="dtscraft@gmail.com" \
git commit -m "your message"
```

## Verify

```bash
git log -1 --format='%an <%ae> | committer: %cn <%ce>'
```

Expected output:

```
David Su <dtscraft@gmail.com> | committer: David Su <dtscraft@gmail.com>
```
