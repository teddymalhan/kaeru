/**
 * CancelFlow Step Functions State Machine
 * Flow: API → Email → Call
 * Handles subscription cancellation workflow with retries and fallbacks
 */
export const cancelFlowDefinition = {
    Comment: "Cancel subscription workflow with API, Email, and Voice call steps",
    StartAt: "UpdateStatus",
    States: {
      // Step 1: Update DetectionItem status to PROCESSING
      UpdateStatus: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${ActHandlerFunction}",
          Payload: {
            action: "update_status",
            status: "PROCESSING",
            detectionItemId: "$.detectionItemId",
            userId: "$.userId"
          }
        },
        ResultPath: "$.statusResult",
        Next: "CancelApiCall",
        Retry: [
          {
            ErrorEquals: ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
            IntervalSeconds: 2,
            MaxAttempts: 3,
            BackoffRate: 2.0
          }
        ],
        Catch: [
          {
            ErrorEquals: ["States.ALL"],
            Next: "UpdateStatusFailed",
            ResultPath: "$.error"
          }
        ]
      },

      // Step 2: Try API-based cancellation
      CancelApiCall: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${CancelApiFunction}",
          Payload: {
            detectionItemId: "$.detectionItemId",
            userId: "$.userId",
            metadata: "$.metadata"
          }
        },
        ResultPath: "$.apiResult",
        Next: "CheckApiResult",
        Retry: [
          {
            ErrorEquals: ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
            IntervalSeconds: 3,
            MaxAttempts: 2,
            BackoffRate: 2.0
          }
        ],
        Catch: [
          {
            ErrorEquals: ["States.ALL"],
            Next: "EmailFallback",
            ResultPath: "$.apiError"
          }
        ]
      },

      // Step 3: Check if API cancellation was successful
      CheckApiResult: {
        Type: "Choice",
        Choices: [
          {
            Variable: "$.apiResult.Payload.success",
            BooleanEquals: true,
            Next: "UpdateStatusSuccess"
          }
        ],
        Default: "EmailFallback"
      },

      // Step 4: Email-based cancellation fallback
      EmailFallback: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${CancelEmailFunction}",
          Payload: {
            detectionItemId: "$.detectionItemId",
            userId: "$.userId",
            metadata: "$.metadata",
            reason: "API cancellation failed, using email fallback"
          }
        },
        ResultPath: "$.emailResult",
        Next: "CheckEmailResult",
        Retry: [
          {
            ErrorEquals: ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
            IntervalSeconds: 5,
            MaxAttempts: 2,
            BackoffRate: 1.5
          }
        ],
        Catch: [
          {
            ErrorEquals: ["States.ALL"],
            Next: "VoiceCallFallback",
            ResultPath: "$.emailError"
          }
        ]
      },

      // Step 5: Check if email cancellation was successful
      CheckEmailResult: {
        Type: "Choice",
        Choices: [
          {
            Variable: "$.emailResult.Payload.success",
            BooleanEquals: true,
            Next: "UpdateStatusSuccess"
          }
        ],
        Default: "VoiceCallFallback"
      },

      // Step 6: Voice call fallback (VAPI)
      VoiceCallFallback: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${CancelViaVapiFunction}",
          Payload: {
            detectionItemId: "$.detectionItemId",
            userId: "$.userId",
            metadata: "$.metadata",
            reason: "API and Email cancellation failed, using voice call"
          }
        },
        ResultPath: "$.voiceResult",
        Next: "CheckVoiceResult",
        Retry: [
          {
            ErrorEquals: ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
            IntervalSeconds: 10,
            MaxAttempts: 2,
            BackoffRate: 1.5
          }
        ],
        Catch: [
          {
            ErrorEquals: ["States.ALL"],
            Next: "UpdateStatusFailed",
            ResultPath: "$.voiceError"
          }
        ]
      },

      // Step 7: Check if voice call was successful
      CheckVoiceResult: {
        Type: "Choice",
        Choices: [
          {
            Variable: "$.voiceResult.Payload.success",
            BooleanEquals: true,
            Next: "UpdateStatusSuccess"
          }
        ],
        Default: "UpdateStatusFailed"
      },

      // Success: Update status to CANCELLED
      UpdateStatusSuccess: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${ActHandlerFunction}",
          Payload: {
            action: "update_status",
            status: "CANCELLED",
            detectionItemId: "$.detectionItemId",
            userId: "$.userId",
            cancellationMethod: "$.cancellationMethod"
          }
        },
        ResultPath: "$.finalResult",
        End: true,
        Retry: [
          {
            ErrorEquals: ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
            IntervalSeconds: 2,
            MaxAttempts: 3,
            BackoffRate: 2.0
          }
        ],
        Catch: [
          {
            ErrorEquals: ["States.ALL"],
            Next: "UpdateStatusFailed",
            ResultPath: "$.finalError"
          }
        ]
      },

      // Failure: Update status to FAILED
      UpdateStatusFailed: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${ActHandlerFunction}",
          Payload: {
            action: "update_status",
            status: "FAILED",
            detectionItemId: "$.detectionItemId",
            userId: "$.userId",
            error: "$.error"
          }
        },
        ResultPath: "$.failureResult",
        End: true
      }
    }
};
