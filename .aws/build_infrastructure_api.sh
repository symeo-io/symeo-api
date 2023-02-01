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
    -p|--profile)
    PROFILE="$2"
    shift # past argument
    ;;
    -ddik|--datadog-api-key)
    DATADOG_API_KEY="$2"
    shift # past argument
    ;;
    -d|--domain)
    DOMAIN="$2"
    shift # past argument
    ;;
    -pu|--prefix-url)
    PREFIX_URL="$2"
    shift # past argument
    ;;
    -acmc|--acm-arn)
    ACM_ARN="$2"
    shift # past argument
    ;;
    -acma|--acm-arn-alb)
    ACM_ARN_ALB="$2"
    shift # past argument
    ;;
    -t|--tag)
    TAG="$2"
    shift # past argument
    ;;
    -v|--vpc-id)
    VPC_ID="$2"
    shift # past argument
    ;;
    -s|--subnets)
    SUBNETS="$2"
    shift # past argument
    ;;
    *)
    printf "***************************\n"
    printf "* Error: Invalid argument in build infra api %s=%s.*\n" "$1" "$2"
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

if [ -z "$TAG" ]
then
    MY_TAG="latest"
else
    MY_TAG=$TAG
fi

## Build Public Url
PUBLIC_URL=${PREFIX_URL}.${DOMAIN}

export_stack_outputs symeo-api-sg-${ENV} ${REGION}
export_stack_outputs symeo-api-iam-${ENV} ${REGION}
export_stack_outputs symeo-api-monitoring-${ENV} ${REGION}
export_stack_outputs symeo-api-aurora-${ENV} ${REGION}
export_stack_outputs symeo-api-s3-${ENV} ${REGION}

## Application Load Balancer
aws cloudformation deploy \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
      CertificateArn=${ACM_ARN_ALB} \
      Env=${ENV} \
      SecurityGroup=${SymeoApiAlbSg} \
      Subnets=${SUBNETS} \
      VpcId=${VPC_ID} \
  --region ${REGION} \
  --stack-name symeo-api-alb-${ENV} \
  --template-file cloudformation/api/alb.yml

export_stack_outputs symeo-api-alb-${ENV} ${REGION}

## Cloudfront
aws cloudformation deploy \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
      AlbDNS=${ServiceId} \
      CertificateArn=${ACM_ARN} \
      Env=${ENV} \
      PublicAlias=${PUBLIC_URL} \
  --region ${REGION} \
  --stack-name symeo-api-cloudfront-${ENV} \
  --template-file cloudformation/api/cloudfront.yml \

export_stack_outputs symeo-api-cloudfront-${ENV} ${REGION}

## ECS Repository
aws cloudformation deploy \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
      Env=${ENV} \
  --stack-name symeo-api-ecs-repository-${ENV} \
  --region ${REGION} \
  --template-file cloudformation/api/ecs-repository.yml

export_stack_outputs symeo-api-ecs-repository-${ENV} ${REGION}

## Build Docker Image and push it to the ECS Repository
if docker_image_exists_in_ecr $SymeoApiRepositoryName $MY_TAG $REGION; then
  echo "Docker image with tag ${MY_TAG} already exists, skipping build..."
else
  echo "No image found with tag ${MY_TAG}, building it..."
  ./build_docker.sh -r "$REGION" -e "$ENV" -t "$MY_TAG" -p "$PROFILE" --service "symeo-api-${ENV}" --registry "symeo-api-ecs-repository-${ENV}"
fi

## ECS Cluster
aws cloudformation deploy \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
      Env=${ENV} \
  --region ${REGION} \
  --stack-name symeo-api-ecs-cluster-${ENV} \
  --template-file cloudformation/api/ecs-cluster.yml \

export_stack_outputs symeo-api-ecs-cluster-${ENV} ${REGION}

## ECS Services
aws cloudformation deploy \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
      AlbName=${AlbName} \
      CloudwatchLogsGroup=${CloudwatchLogsGroup} \
      DockerRepository=${SymeoApiRepository} \
      ECSAutoScaleRole=${SymeoApiAutoScaleRole} \
      ECSCluster=${ECSCluster} \
      ECSTaskRole=${SymeoApiTaskRole} \
      ECSExecutionRole=${SymeoApiECSExecutionRole} \
      Env=${ENV} \
      DataDogApiKey=${DATADOG_API_KEY} \
      Tag=${MY_TAG} \
      TargetGroup=${TargetGroup} \
      TargetGroupName=${TargetGroupName} \
      SecurityGroup=${SymeoApiSg} \
      Subnets=${SUBNETS} \
  --region ${REGION} \
  --stack-name symeo-api-ecs-services-${ENV} \
  --template-file cloudformation/api/ecs-services.yml \
