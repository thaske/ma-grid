#!/bin/sh

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$HOOKS_DIR/.." || exit 1

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: Not in a git repository"
  exit 1
fi

GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

echo "Installing git hooks..."

for hook in "$HOOKS_DIR"/*; do
  if [ "$(basename "$hook")" = "install.sh" ]; then
    continue
  fi

  hook_name=$(basename "$hook")
  cp "$hook" "$GIT_HOOKS_DIR/$hook_name"
  chmod +x "$GIT_HOOKS_DIR/$hook_name"

  echo "✅ Installed $hook_name"
done

echo ""
echo "Git hooks installed successfully!"
echo "To skip hooks on commit, use: git commit --no-verify"
