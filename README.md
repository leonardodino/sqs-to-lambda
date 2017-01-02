# sqs-to-lambda

> Trigger Lambda invocations from an SQS queue

This application listens to an SQS queue and creates a Lambda invocation whenever a message is received, bridging the gap between SQS and Lambda.

## Usage

The application needs to run as an IAM user that has permission to consume from your queue and invoke any Lambda functions. If you're running it in EC2 then it will authenticate using an [instance profile](http://docs.aws.amazon.com/IAM/latest/UserGuide/instance-profiles.html), otherwise you need to export your credentials:

```bash
export AWS_SECRET_ACCESS_KEY=...
export AWS_ACCESS_KEY_ID=...
```

Start the application:

```bash
AWS_SQS_QUEUE_URL='<queue-url>' \
AWS_LAMBDA_FUNCTION_NAME='<function-name>' \
AWS_REGION='<aws-region-id>' \
DEBUG=* \
npm start
```

## SQS message format

The SQS message body and Message Parameters are passed as-is to the lamda function. Along with MessageId, ReceiptHandle, and QueueUrl.

## Caution!
the lambda function is invoked as Message, and so it is responsible for deleting the message from the queue after the processing is done.
