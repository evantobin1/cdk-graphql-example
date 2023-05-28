import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_appsync as appsync,
  aws_lambda as lambda,
  aws_dynamodb as ddb,
  aws_cognito as cognito,
} from "aws-cdk-lib";

export class TestCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, "direct-campaign-user-pool", {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    userPool.addDomain("direct-campaign-user-pool-domain", {
      cognitoDomain: {
        domainPrefix: "directcampaign",
      },
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      authFlows: {
        userPassword: true,
      },
    });

    const api = new appsync.GraphqlApi(this, "Api", {
      name: "direct-campaign-graphqlapi",
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userPool,
          },
        },
      },
      schema: appsync.SchemaFile.fromAsset("./graphql/schema2.graphql"),
    });

    const appSyncApiHandler = new lambda.Function(
      this,
      "DirectCampaign-AppSyncApiHandler",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "main.handler",
        code: lambda.Code.fromAsset("lambda-fns/AppSyncApiHandler"),
        memorySize: 1024,
      }
    );

    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource(
      "lambdaDatasource",
      appSyncApiHandler
    );

    // Assignment resolver
    lambdaDs.createResolver("createAssignment", {
      typeName: "Mutation",
      fieldName: "createAssignment",
    });
    lambdaDs.createResolver("updateAssignment", {
      typeName: "Mutation",
      fieldName: "updateAssignment",
    });
    lambdaDs.createResolver("deleteAssignment", {
      typeName: "Mutation",
      fieldName: "deleteAssignment",
    });
    lambdaDs.createResolver("getAssignment", {
      typeName: "Query",
      fieldName: "getAssignment",
    });
    lambdaDs.createResolver("listAssignments", {
      typeName: "Query",
      fieldName: "listAssignments",
    });
    // Campaign resolver
    lambdaDs.createResolver("createCampaign", {
      typeName: "Mutation",
      fieldName: "createCampaign",
    });
    lambdaDs.createResolver("updateCampaign", {
      typeName: "Mutation",
      fieldName: "updateCampaign",
    });
    lambdaDs.createResolver("deleteCampaign", {
      typeName: "Mutation",
      fieldName: "deleteCampaign",
    });
    lambdaDs.createResolver("getCampaign", {
      typeName: "Query",
      fieldName: "getCampaign",
    });
    lambdaDs.createResolver("listCampaigns", {
      typeName: "Query",
      fieldName: "listCampaigns",
    });
    // Assignment resolver
    lambdaDs.createResolver("createDoor", {
      typeName: "Mutation",
      fieldName: "createDoor",
    });
    lambdaDs.createResolver("updateDoor", {
      typeName: "Mutation",
      fieldName: "updateDoor",
    });
    lambdaDs.createResolver("deleteDoor", {
      typeName: "Mutation",
      fieldName: "deleteDoor",
    });
    lambdaDs.createResolver("getDoor", {
      typeName: "Query",
      fieldName: "getDoor",
    });
    lambdaDs.createResolver("listDoors", {
      typeName: "Query",
      fieldName: "listDoors",
    });
    // Resident resolver
    lambdaDs.createResolver("createResident", {
      typeName: "Mutation",
      fieldName: "createResident",
    });
    lambdaDs.createResolver("updateResident", {
      typeName: "Mutation",
      fieldName: "updateResident",
    });
    lambdaDs.createResolver("deleteResident", {
      typeName: "Mutation",
      fieldName: "deleteResident",
    });
    lambdaDs.createResolver("getResident", {
      typeName: "Query",
      fieldName: "getResident",
    });
    lambdaDs.createResolver("listResidents", {
      typeName: "Query",
      fieldName: "listResidents",
    });
    // Route resolver
    lambdaDs.createResolver("createRoute", {
      typeName: "Mutation",
      fieldName: "createRoute",
    });
    lambdaDs.createResolver("updateRoute", {
      typeName: "Mutation",
      fieldName: "updateRoute",
    });
    lambdaDs.createResolver("deleteRoute", {
      typeName: "Mutation",
      fieldName: "deleteRoute",
    });
    lambdaDs.createResolver("getRoute", {
      typeName: "Query",
      fieldName: "getRoute",
    });
    lambdaDs.createResolver("listRoutes", {
      typeName: "Query",
      fieldName: "listRoutes",
    });
    // Task resolver
    lambdaDs.createResolver("createTask", {
      typeName: "Mutation",
      fieldName: "createTask",
    });
    lambdaDs.createResolver("updateTask", {
      typeName: "Mutation",
      fieldName: "updateTask",
    });
    lambdaDs.createResolver("deleteTask", {
      typeName: "Mutation",
      fieldName: "deleteTask",
    });
    lambdaDs.createResolver("getTask", {
      typeName: "Query",
      fieldName: "getTask",
    });
    lambdaDs.createResolver("listTasks", {
      typeName: "Query",
      fieldName: "listTasks",
    });
    // Volunteer resolver
    lambdaDs.createResolver("createVolunteer", {
      typeName: "Mutation",
      fieldName: "createVolunteer",
    });
    lambdaDs.createResolver("updateVolunteer", {
      typeName: "Mutation",
      fieldName: "updateVolunteer",
    });
    lambdaDs.createResolver("deleteVolunteer", {
      typeName: "Mutation",
      fieldName: "deleteVolunteer",
    });
    lambdaDs.createResolver("getVolunteer", {
      typeName: "Query",
      fieldName: "getVolunteer",
    });
    lambdaDs.createResolver("listVolunteers", {
      typeName: "Query",
      fieldName: "listVolunteers",
    });

    const assignmentTable = new ddb.Table(this, "AssignmentTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    })
    assignmentTable.grantFullAccess(appSyncApiHandler);

    const campaignTable = new ddb.Table(this, "CampaignTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    })
    campaignTable.grantFullAccess(appSyncApiHandler);

    const doorTable = new ddb.Table(this, "DoorTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    })
    doorTable.grantFullAccess(appSyncApiHandler);

    const residentTable = new ddb.Table(this, "ResidentTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    })
    residentTable.grantFullAccess(appSyncApiHandler);

    const routeTable = new ddb.Table(this, "RouteTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    })
    routeTable.grantFullAccess(appSyncApiHandler);

    const taskTable = new ddb.Table(this, "TaskTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    })
    taskTable.grantFullAccess(appSyncApiHandler);

    const volunteerTable = new ddb.Table(this, "VolunteerTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    })
    volunteerTable.grantFullAccess(appSyncApiHandler);
    

    // Create an environment variable that we will use in the function code
    appSyncApiHandler
      .addEnvironment("ASSIGNMENT_TABLE", assignmentTable.tableName)
      .addEnvironment("CAMPAIGN_TABLE", campaignTable.tableName)
      .addEnvironment("DOOR_TABLE", doorTable.tableName)
      .addEnvironment("RESIDENT_TABLE", residentTable.tableName)
      .addEnvironment("ROUTE_TABLE", routeTable.tableName)
      .addEnvironment("TASK_TABLE", taskTable.tableName)
      .addEnvironment("VOLUNTEER_TABLE", volunteerTable.tableName);
  }
}
