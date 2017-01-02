#! /usr/bin/env node
'use strict'

const pkg = require('./package')
const AWS = require('aws-sdk')
const Consumer = require('@leonardodino/sqs-consumer')
const _Debug = require('debug')

const debug = _Debug(pkg.name)
const receive = _Debug(`${pkg.name}:receive`)

const ENV = process.env || {}
const region = ENV['AWS_REGION']
const queueUrl = ENV['AWS_SQS_QUEUE_URL']
const FunctionName = ENV['AWS_LAMBDA_FUNCTION_NAME'] //CamelCase

HANDLE_MISSING_REQUIRED_PARAMETERS(region, queueUrl, FunctionName)

const lambda = new AWS.Lambda({region, apiVersion: '2015-03-31'})

const consumer = new Consumer({
  region,
  queueUrl,
  handleMessage,
  custom: true,
  messageAttributeNames: ['All'],
})

consumer.on('error', ({message}) => console.error(message))
consumer.on('processing_error', ({message}) => console.error(message))

// start
console.log(`> Starting ${pkg.name} v${pkg.version}`)

lambda.getFunction({FunctionName}, (err) => {
  if(err){return HANDLE_FUNCTION_NOT_FOUND()}
  consumer.start()
})

// message handler
function handleMessage({MessageId, ReceiptHandle, Body, MessageAttributes, QueueUrl}, done){
  const message = {MessageId, ReceiptHandle, Body, MessageAttributes, QueueUrl}
  const Payload = JSON.stringify(message)

  receive(Payload)
  lambda.invoke({
    Payload,
    FunctionName,
    InvocationType: 'Event',
  }, done)
}

// error handlers
function HANDLE_FUNCTION_NOT_FOUND(err){
  console.error('Could not get Lambda function with name', FunctionName + ':')
  console.error('  ' + err.message)
  process.exit(1)
}

function HANDLE_MISSING_REQUIRED_PARAMETERS(...required){
  if(!required.some(x=>!x)){return}
  console.error('Missing required Environment constiables:')
  console.error('  [AWS_REGION, AWS_SQS_QUEUE_URL, AWS_LAMBDA_FUNCTION_NAME]')
  process.exit(1)
}
