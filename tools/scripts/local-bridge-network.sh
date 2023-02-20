#!/bin/bash

# This script creates a local bridge network with a local relayer for development purposes.

# The script assumes that the operator has cleared their local storage and is running MacOS.

current_dir=$(pwd)
defaultPath="$current_dir/local-webb-dapp"

shopt -s nocasematch
echo "Executing script to create local bridge network...\n"

# Check to see if the directory exists else create it
echo "Check to see if the directory exists else create it...\n"
[ -d $defaultPath ] || mkdir $defaultPath

echo "Executing script to compile Webb smart contracts...\n"
osascript -e "tell app \"Terminal\"
    do script \"cd $current_dir && chmod u+x ./contracts.sh && ./contracts.sh $defaultPath\"
end tell"

echo "Waiting for ./contracts.sh to finish...\n"
sleep 230

echo "Executing script to build Webb relayer in a Terminal window...\n"
osascript -e "tell app \"Terminal\"
    do script \"cd $current_dir && chmod u+x ./relayer.sh && ./relayer.sh $defaultPath\"
end tell"

echo "Executing script to build Webb bridge in a Terminal window...\n"
osascript -e "tell app \"Terminal\"
    do script \"cd $current_dir && chmod u+x ./bridge.sh && ./bridge.sh $defaultPath\"
end tell"

echo "Done! Check your Terminal windows for the EVM localnet, relayer and bridge."
