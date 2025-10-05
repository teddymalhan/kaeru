/**
 * DisputeFlow Step Functions State Machine
 * Flow: VAPI → Verify
 * Handles transaction dispute workflow with voice call and verification
 */
export const disputeFlowDefinition = {
    Comment: "Dispute transaction workflow with VAPI call and verification",
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
        Next: "StartVapiCall",
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

      // Step 2: Initiate VAPI call to bank IVR system
      StartVapiCall: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${DisputeViaVapiFunction}",
          Payload: {
            detectionItemId: "$.detectionItemId",
            userId: "$.userId",
            metadata: "$.metadata",
            disputeReason: "$.metadata.disputeReason"
          }
        },
        ResultPath: "$.vapiResult",
        Next: "CheckVapiResult",
        Retry: [
          {
            ErrorEquals: ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
            IntervalSeconds: 5,
            MaxAttempts: 3,
            BackoffRate: 2.0
          }
        ],
        Catch: [
          {
            ErrorEquals: ["States.ALL"],
            Next: "UpdateStatusFailed",
            ResultPath: "$.vapiError"
          }
        ]
      },

      // Step 3: Check if VAPI call was successful
      CheckVapiResult: {
        Type: "Choice",
        Choices: [
          {
            Variable: "$.vapiResult.Payload.success",
            BooleanEquals: true,
            Next: "WaitForCallCompletion"
          }
        ],
        Default: "UpdateStatusFailed"
      },

      // Step 4: Wait for VAPI call to complete (with timeout)
      WaitForCallCompletion: {
        Type: "Wait",
        Seconds: 300, // 5 minutes timeout
        Next: "VerifyCallResult"
      },

      // Step 5: Verify the dispute call result
      VerifyCallResult: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${DisputeViaVapiFunction}",
          Payload: {
            action: "verify_call",
            callId: "$.vapiResult.Payload.callId",
            detectionItemId: "$.detectionItemId",
            userId: "$.userId"
          }
        },
        ResultPath: "$.verificationResult",
        Next: "CheckVerificationResult",
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
            ResultPath: "$.verificationError"
          }
        ]
      },

      // Step 6: Check verification result
      CheckVerificationResult: {
        Type: "Choice",
        Choices: [
          {
            Variable: "$.verificationResult.Payload.disputeSubmitted",
            BooleanEquals: true,
            Next: "SaveArtifacts"
          },
          {
            Variable: "$.verificationResult.Payload.callStatus",
            StringEquals: "completed",
            Next: "SaveArtifacts"
          }
        ],
        Default: "UpdateStatusFailed"
      },

      // Step 7: Save call artifacts (transcript, case ID, etc.)
      SaveArtifacts: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${ActHandlerFunction}",
          Payload: {
            action: "save_artifacts",
            detectionItemId: "$.detectionItemId",
            userId: "$.userId",
            artifacts: {
              transcript: "$.verificationResult.Payload.transcript",
              caseId: "$.verificationResult.Payload.caseId",
              callDuration: "$.verificationResult.Payload.callDuration",
              disputeStatus: "$.verificationResult.Payload.disputeStatus"
            }
          }
        },
        ResultPath: "$.artifactsResult",
        Next: "UpdateStatusSuccess",
        Retry: [
          {
            ErrorEquals: ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
            IntervalSeconds: 3,
            MaxAttempts: 2,
            BackoffRate: 1.5
          }
        ],
        Catch: [
          {
            ErrorEquals: ["States.ALL"],
            Next: "UpdateStatusSuccess", // Don't fail the entire workflow if artifact saving fails
            ResultPath: "$.artifactsError"
          }
        ]
      },

      // Success: Update status to DISPUTED
      UpdateStatusSuccess: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: "${ActHandlerFunction}",
          Payload: {
            action: "update_status",
            status: "DISPUTED",
            detectionItemId: "$.detectionItemId",
            userId: "$.userId",
            disputeMethod: "voice_call",
            caseId: "$.verificationResult.Payload.caseId"
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
