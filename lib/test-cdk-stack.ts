import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_appsync as appsync, aws_lambda as lambda, aws_dynamodb as ddb, aws_cognito as cognito} from 'aws-cdk-lib';

export class TestCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, 'direct-campaign-user-pool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      }
    })

    userPool.addDomain("direct-campaign-user-pool-domain", {
      cognitoDomain: {
        domainPrefix: "directcampaign"
      }
    })

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool
    })

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'direct-campaign-graphqlapi',
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userPool
          }
        } 
      },
      schema: appsync.SchemaFile.fromAsset('./graphql/schema.graphql'),
    });

    const productLambda = new lambda.Function(this, 'AppSyncProductHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
      memorySize: 1024
    })
    
    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', productLambda)

    lambdaDs.createResolver("getProductById", {
      typeName: "Query",
      fieldName: "getProductById"
    })
    
    lambdaDs.createResolver("listProducts", {
      typeName: "Query",
      fieldName: "listProducts"
    })
    
    lambdaDs.createResolver("productsByCategory", {
      typeName: "Query",
      fieldName: "productsByCategory"
    })
    
    lambdaDs.createResolver("createProduct", {
      typeName: "Mutation",
      fieldName: "createProduct"
    })
    
    lambdaDs.createResolver("deleteProduct", {
      typeName: "Mutation",
      fieldName: "deleteProduct"
    })
    
    lambdaDs.createResolver("updateProduct", {
      typeName: "Mutation",
      fieldName: "updateProduct"
    })
    
    const productTable = new ddb.Table(this, 'CDKProductTable', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    })
    
    // Add a global secondary index to enable another data access pattern
    productTable.addGlobalSecondaryIndex({
      indexName: "productsByCategory",
      partitionKey: {
        name: "category",
        type: ddb.AttributeType.STRING,
      }
    })
    
    // Enable the Lambda function to access the DynamoDB table (using IAM)
    productTable.grantFullAccess(productLambda)
    
    // Create an environment variable that we will use in the function code
    productLambda.addEnvironment('PRODUCT_TABLE', productTable.tableName)


  }
}
