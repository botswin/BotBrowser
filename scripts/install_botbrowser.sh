#!/usr/bin/env bash
set -euo pipefail

# Configuration
REPO="botswin/BotBrowser"
DMG_FILE="/tmp/BotBrowser.dmg"
MOUNT_POINT="$(mktemp -d /tmp/botbrowser_mnt.XXXX)"
APP_NAME="Chromium.app"
DEST_DIR="/Applications"

# Detect architecture
ARCH="$(uname -m)"
if [ "$ARCH" = "arm64" ]; then
  DMG_PATTERN="mac_arm64.dmg"
elif [ "$ARCH" = "x86_64" ]; then
  DMG_PATTERN="mac_x86_64.dmg"
else
  echo "Error: Unsupported architecture: $ARCH"
  exit 1
fi

echo "1. Fetching latest release info..."
DMG_URL="$(curl -sL "https://api.github.com/repos/${REPO}/releases/latest" \
  | grep "browser_download_url" \
  | grep "$DMG_PATTERN" \
  | head -1 \
  | cut -d '"' -f 4)"

if [ -z "$DMG_URL" ]; then
  echo "Error: Could not find DMG download URL for $DMG_PATTERN"
  exit 1
fi

echo "   Found: $DMG_URL"
echo "2. Downloading the DMG..."
curl -L "$DMG_URL" -o "$DMG_FILE"

echo "3. Attaching the DMG to ${MOUNT_POINT}..."
hdiutil attach "$DMG_FILE" -mountpoint "$MOUNT_POINT" -nobrowse -quiet

echo "4. Copying ${APP_NAME} to ${DEST_DIR}..."
if [ -d "${MOUNT_POINT}/${APP_NAME}" ]; then
  # Copy the application bundle to /Applications
  cp -R "${MOUNT_POINT}/${APP_NAME}" "${DEST_DIR}/"
else
  echo "Error: ${APP_NAME} not found in the mounted volume"
  # Attempt to detach before exiting on error
  hdiutil detach "$(hdiutil info | grep "${MOUNT_POINT}" -B1 | head -n1 | awk '{print $1}')" -quiet || true
  exit 1
fi

echo "5. Removing quarantine attribute from the app..."
# Remove the com.apple.quarantine attribute so macOS won't block on first launch
xattr -rd com.apple.quarantine "${DEST_DIR}/${APP_NAME}"

echo "6. Detaching the DMG..."
# Find and detach the device associated with our mount point
hdiutil detach "$(hdiutil info | grep "${MOUNT_POINT}" -B1 | head -n1 | awk '{print $1}')" -quiet

echo "7. Cleaning up temporary files..."
rm -rf "$MOUNT_POINT" "$DMG_FILE"

echo "Installation complete: ${APP_NAME} is now in ${DEST_DIR}"
