#!/bin/bash

trap "echo; exit" INT
trap "echo; exit" HUP

# try to fetch public IP address if value not set in .env
PUBLIC_IP_ADDRESS_FALLBACK=$(wget http://ipecho.net/plain -O - -q ; echo)
NAME_PROJECT_FALLBACK=webb-monorepo
NAME_BRIDGE_DAPP_FALLBACK=bridge-dapp
NAME_STATS_DAPP_FALLBACK=stats-dapp

# assign fallback values for environment variables from .env.example incase
# not declared in .env file. alternative approach is `echo ${X:=$X_FALLBACK}`
source $(dirname "$0")/.env.example
source $(dirname "$0")/.env
export NAME_PROJECT=$(jq '.name' $PWD/package.json | sed 's/\"//g')
export NAME_BRIDGE_DAPP=$(jq '.name' $PWD/apps/bridge-dapp/package.json | sed 's/\"//g' | sed 's/.*\///g')
export NAME_STATS_DAPP=$(jq '.name' $PWD/apps/stats-dapp/package.json | sed 's/\"//g' | sed 's/.*\///g')
export PORT_BRIDGE_DAPP PORT_STATS_DAPP
echo ${PUBLIC_IP_ADDRESS:=$PUBLIC_IP_ADDRESS_FALLBACK}
echo ${NAME_PROJECT:=$NAME_PROJECT_FALLBACK}
echo ${NAME_BRIDGE_DAPP:=$NAME_BRIDGE_DAPP_FALLBACK}
echo ${NAME_STATS_DAPP:=$NAME_STATS_DAPP_FALLBACK}
if [ "$NODE_ENV" != "development" ]; then
    printf "\nError: NODE_ENV should be set to development in .env\n";
    kill "$PPID"; exit 1;
fi
printf "\n*** Started building Docker container."
printf "\n*** Please wait... \n***"
DOCKER_BUILDKIT=0 docker compose -f docker-compose-dev.yml up --build -d
if [ $? -ne 0 ]; then
    kill "$PPID"; exit 1;
fi
printf "\n*** Finished building Docker container.\n"
if [ "$PUBLIC_IP_ADDRESS" != "" ]; then
    printf "\n*** Public IP address: http://${PUBLIC_IP_ADDRESS}\n***\n";
fi
