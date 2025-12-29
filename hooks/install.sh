#!/bin/sh
# Install git hooks for this repository

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

echo "Installing git hooks..."

for hook in "$HOOKS_DIR"/*; do
  # Skip this install script
  if [ "$(basename "$hook")" = "install.sh" ]; then
    continue
  fi

  hook_name=$(basename "$hook")

  # Copy hook to .git/hooks
  cp "$hook" "$GIT_HOOKS_DIR/$hook_name"
  chmod +x "$GIT_HOOKS_DIR/$hook_name"

  echo "✅ Installed $hook_name"
done

echo ""
echo "Git hooks installed successfully!"
echo "To skip hooks on commit, use: git commit --no-verify"
