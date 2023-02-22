function export_stack_outputs() {
    local stack_name=$1
    local region=$2

    export $(aws cloudformation describe-stacks --stack-name $stack_name --region $region --output text --query 'Stacks[].Outputs[]' | tr '\t' '=')
}

function get_amazon_linux_2_ami_id() {
    local region=$1

    echo $(aws ssm get-parameters --names /aws/service/ecs/optimized-ami/amazon-linux-2/recommended --region $region --output text --query 'Parameters[].Value' | jq -r '.image_id')
}

function docker_image_exists_in_ecr() {
    local repository_name=$1
    local image_tag=$2
    local region=$3

    aws ecr describe-images --repository-name=$repository_name --image-ids=imageTag=$image_tag --region=$region
}

function stack_exists() {
    local stack_name=$1
    local region=$2

    aws cloudformation describe-stacks --stack-name $stack_name --region $region
}

function get_aws_account_id() {
    echo $(aws sts get-caller-identity --query "Account" --output text)
}

function login_to_ecr() {
    local region=$1
    local aws_account_id=$(get_aws_account_id)

    aws ecr get-login-password \
        --region ${region} \
    | docker login \
        --username AWS \
        --password-stdin ${aws_account_id}.dkr.ecr.${region}.amazonaws.com
}

function build_and_push_docker_image() {
  local docker_base_path=$1
  local docker_file_name=$2
  local registry_stack_name=$3
  local repository_stack_var_name=$4
  local region=$5
  local tag=$6
  local dd_service=$7
  local dd_env=$8
  local symeo_api_key=$9

  local docker_file_path="${docker_base_path}/${docker_file_name}"

  export_stack_outputs $registry_stack_name $region

  local repository=${!repository_stack_var_name}

  login_to_ecr $region

  docker build --no-cache \
    --tag "${repository}:${tag}" \
    --tag "${repository}:latest" \
    --build-arg dd_service="$dd_service" \
    --build-arg dd_env="$dd_env" \
    --build-arg symeo_api_key="$symeo_api_key" \
    -f $docker_file_path $docker_base_path
  docker push "${repository}" --all-tags
}

function set_datadog_forwarder_arn_to_env() {
    local stack_name=$1
    local region=$2

    export DatadogForwarderArn=$(aws cloudformation describe-stacks --stack-name $stack_name --region $region --output text --query 'Stacks[].Outputs[]' | tr '\t' '=' | grep 'DatadogForwarderArn' | grep -o '[^=]*$')
}
