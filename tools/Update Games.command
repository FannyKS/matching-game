#!/bin/bash
#
# Double-click this file in Finder to refresh the game after adding images.
# macOS runs it in Terminal and holds the window open so you can read the result.

cd "$(dirname "$0")/.." || exit 1

clear
echo "==============================================="
echo " Updating the matching game image list"
echo "==============================================="
echo ""

bash tools/generate_games.sh
status=$?

echo ""
if [ $status -eq 0 ]; then
    echo "Done. Switch back to your browser and reload the page."
else
    echo "That did not work. The message above says why."
fi
echo ""
echo "Press return to close this window."
read -r _
exit $status
