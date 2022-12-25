trap "echo; exit" INT
trap "echo; exit" HUP
source .env \
    && export NAME_PROJECT NAME_BRIDGE_DAPP NAME_STATS_DAPP PORT_BRIDGE_DAPP PORT_STATS_DAPP \
    && printf "\n*** Started building Docker container." \
    && printf "\n*** Please wait... \n***" \
    && DOCKER_BUILDKIT=0 docker compose -f docker-compose-dev.yml up --build -d
printf "\n*** Finished building Docker container.\n"
