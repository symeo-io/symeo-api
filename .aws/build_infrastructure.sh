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
    -dbp|--db-password)
    DB_PASSWORD="$2"
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
    printf "* Error: Invalid argument in build infra %s=%s.*\n" "$1" "$2"
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

## Security Groups
aws cloudformation deploy \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
      Env=${ENV} \
      VpcId=${VPC_ID} \
  --region ${REGION} \
  --stack-name symeo-api-sg-${ENV} \
  --template-file cloudformation/security-groups.yml

export_stack_outputs symeo-api-sg-${ENV} ${REGION}

## IAM Roles
aws cloudformation deploy \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
      Env=${ENV} \
      SecretName=${SECRET_ID} \
  --region ${REGION} \
  --stack-name symeo-api-iam-${ENV} \
  --template-file cloudformation/iam.yml

export_stack_outputs symeo-api-iam-${ENV} ${REGION}

## Monitoring (Log Group, Alarms, ...)
aws cloudformation deploy \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
      Env=${ENV} \
  --region ${REGION} \
  --stack-name symeo-api-monitoring-${ENV} \
  --template-file cloudformation/monitoring.yml

export_stack_outputs symeo-api-monitoring-${ENV} ${REGION}

## Database
# Only create db stack if it does not already exist
# TODO: add a way to force the update with script parameter
if ! stack_exists "symeo-api-rds-${ENV}" $REGION
then
  aws cloudformation deploy \
    --no-fail-on-empty-changeset \
    --parameter-overrides \
        DBPassword=${DB_PASSWORD} \
        Env=${ENV} \
        SymeoApiDatabaseSg=${SymeoApiDatabaseSg} \
    --region ${REGION} \
    --stack-name symeo-api-rds-${ENV} \
    --template-file cloudformation/rds.yml
fi

export_stack_outputs symeo-api-rds-${ENV} ${REGION}

./build_infrastructure_api.sh \
  --region "$REGION" \
  --env "$ENV" \
  --profile "$PROFILE" \
  --domain "$DOMAIN" \
  --prefix-url "$PREFIX_URL" \
  --acm-arn "$ACM_ARN" \
  --acm-arn-alb "$ACM_ARN_ALB" \
  --tag "$MY_TAG" \
  --vpc-id "$VPC_ID" \
  --subnets "$SUBNETS"

echo "DONE"
