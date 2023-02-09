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
    -ddk|--datadog-api-key)
    DATADOG_API_KEY="$2"
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
  \"dockerLabels\": {
    \"com.datadoghq.ad.instances\": \"[{\\\"host\\\": \\\"%%host%%\\\", \\\"port\\\": 9999}]\",
    \"com.datadoghq.ad.check_names\": \"[\\\"symeo-api-${ENV}\\\"]\",
    \"com.datadoghq.ad.init_configs\": \"[{}]\"
  },
  \"healthCheck\": {
    \"command\": [\"CMD-SHELL\", \"curl -f http://localhost:9999/ || exit 1\"],
    \"interval\": 5,
    \"retries\": 2,
    \"timeout\": 3
  },
  \"logConfiguration\":{
    \"logDriver\":\"awslogs\",
    \"options\":{
      \"awslogs-group\":\"${CloudwatchLogsGroup}\",
      \"awslogs-region\":\"${REGION}\",
      \"awslogs-stream-prefix\":\"symeo-api\"
    }
  }
}"

datadog_container="
{
  \"name\":\"DataDogAgent-${ENV}\",
  \"image\":\"public.ecr.aws/datadog/agent:latest\",
  \"cpu\":100,
  \"memory\":256,
  \"portMappings\":[{
    \"hostPort\":8126,
    \"protocol\":\"tcp\",
    \"containerPort\":8126
  }],
  \"dockerLabels\": {
    \"com.datadoghq.ad.instances\": \"[{\\\"dbm\\\":true,\\\"host\\\":\\\"${ClusterEndpoint}\\\",\\\"username\\\":\\\"datadog\\\"\\\"password\\\": \\\"${DB_PASSWORD}\\\"\\\"port\\\": 9999}]\",
    \"com.datadoghq.ad.check_names\": \"[\\\"postgres\\\"]\",
    \"com.datadoghq.ad.init_configs\": \"[{}]\"
  },
  \"environment\":[
    {\"name\":\"DD_API_KEY\",\"value\":\"${DATADOG_API_KEY}\"},
    {\"name\":\"DD_SITE\",\"value\":\"datadoghq.eu\"},
    {\"name\":\"DD_APM_ENABLED\",\"value\":\"true\"},
    {\"name\":\"DD_APM_NON_LOCAL_TRAFFIC\",\"value\":\"true\"},
    {\"name\":\"ECS_FARGATE\",\"value\":\"true\"},
    {\"name\":\"DD_APM_IGNORE_RESOURCES\",\"value\":\"GET /actuator/health\"}
  ]
}
"

if [ "$ENV" = "production" ]
then
  container_definition="[${api_container},${datadog_container}]"
else
  container_definition="[${api_container}]"
fi


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
