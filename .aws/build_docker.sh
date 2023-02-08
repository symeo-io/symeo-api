#!/bin/bash
source ./utils.sh

set -e

########################
### NAMING ARGUMENTS ###
########################

while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -r|--region)
    REGION="$2"
    shift # past argument
    ;;
    -e|--env)
    ENV="$2"
    shift # past argument
    ;;
    -t|--tag)
    TAG="$2"
    shift # past argument
    ;;
    -p|--profile)
    PROFILE="$2"
    shift # past argument
    ;;
    -s|--service)
    DD_SERVICE="$2"
    shift # past argument
    ;;
    -a|--symeo-api-key)
    SYMEO_API_KEY="$2"
    shift # past argument
    ;;
    -ry|--registry)
    REGISTRY="$2"
    shift # past argument
    ;;
    *)
    printf "***************************\n"
    printf "* Error: Invalid argument in build docker %s=%s.*\n" "$1" "$2"
    printf "***************************\n"
    exit 1
esac
shift # past argument or value
done

# We check if AWS Cli profile is in parameters to set env var
if [ -z "$PROFILE" ]
then
    echo "Profile parameter is empty, the default profile will be used !"
else
    export AWS_PROFILE=${PROFILE}
fi

GIT_ROOT_PATH=$(git rev-parse --show-toplevel)

build_and_push_docker_image $GIT_ROOT_PATH "Dockerfile" ${REGISTRY} "SymeoApiRepository" $REGION $TAG $DD_SERVICE $ENV $SYMEO_API_KEY

echo "DONE"

