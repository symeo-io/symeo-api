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
    -t|--tag)
    TAG="$2"
    shift # past argument
    ;;
    -e|--env)
    ENV="$2"
    shift # past argument
    ;;
    -p|--profile)
    PROFILE="$2"
    shift # past argument
    ;;
    *)
    printf "***************************\n"
    printf "* Error: Invalid argument in deploy api %s=%s.*\n" "$1" "$2"
    printf "***************************\n"
    exit 1
esac
shift # past argument or value
done

# We check if AWS Cli profile is in parameters to set env var
if [ -z "${PROFILE}" ]
then
echo "Profile parameter is empty, the default profile will be used!"
else
    export AWS_PROFILE=${PROFILE}
fi

export_stack_outputs symeo-api-monitoring-${ENV} ${REGION}
export_stack_outputs symeo-api-iam-${ENV} ${REGION}
export_stack_outputs symeo-api-ecs-repository-${ENV} ${REGION}
export_stack_outputs symeo-api-ecs-cluster-${ENV} ${REGION}
export_stack_outputs symeo-api-ecs-services-${ENV} ${REGION}
export_stack_outputs symeo-api-aurora-${ENV} ${REGION}

AccountId=$(get_aws_account_id)

api_container="
{
  \"name\":\"SymeoApiContainer-${ENV}\",
  \"image\":\"${SymeoApiRepository}:${TAG}\",
  \"portMappings\":[{\"containerPort\":9999}],
  \"cpu\":412,
  \"memory\":768,
  \"logConfiguration\":{
    \"logDriver\":\"awslogs\",
    \"options\":{
      \"awslogs-group\":\"${CloudwatchLogsGroup}\",
      \"awslogs-region\":\"${REGION}\",
      \"awslogs-stream-prefix\":\"symeo-api\"
    }
  }
}"

# if [ "$ENV" = "production" ]
# then
# else
#  container_definition="[${api_container}]"
# fi


aws ecs register-task-definition \
  --task-role-arn arn:aws:iam::${AccountId}:role/${SymeoApiTaskRole} \
  --execution-role-arn arn:aws:iam::${AccountId}:role/${SymeoApiECSExecutionRole} \
  --family ${FamilyName} \
  --region ${REGION} \
  --requires-compatibilities FARGATE \
  --cpu 512 \
  --memory 1024 \
  --network-mode awsvpc \
  --container-definitions "$container_definition"

aws ecs update-service --cluster ${ECSCluster} --service ${ServiceName} --task-definition ${FamilyName} --region ${REGION}

aws ecs wait services-stable --cluster ${ECSCluster} --services ${ServiceName} --region ${REGION}

echo "DONE"
