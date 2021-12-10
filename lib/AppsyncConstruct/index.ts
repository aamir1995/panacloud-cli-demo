import { aws_appsync as appsync, CfnOutput } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
interface AppsyncProps {
  myApi_lambdaFn_studentArn: string;
  myApi_lambdaFn_addStudentArn: string;
  prod?: string;
}

export class AppsyncConstruct extends Construct {
  public api_url: string;
  public api_key: string;

  constructor(scope: Construct, id: string, props?: AppsyncProps) {
    super(scope, id);

    const myApi_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      props?.prod ? props?.prod + "myApi" : "myApi",
      {
        authenticationType: "API_KEY",
        name: props?.prod ? props?.prod + "myApi" : "myApi",
      }
    );
    const myApi_schema: appsync.CfnGraphQLSchema = new appsync.CfnGraphQLSchema(
      this,
      props?.prod ? props?.prod + "myApiSchema" : "myApiSchema",
      {
        apiId: myApi_appsync.attrApiId,
        definition: `scalar AWSDate
scalar AWSTime
scalar AWSDateTime
scalar AWSTimestamp
scalar AWSEmail
scalar AWSJSON
scalar AWSURL
scalar AWSPhone
scalar AWSIPAddress

type Student {
  id: String!
  name: String
}

type Query {
  student (id: String): Student

}

type Mutation {
  addStudent (name: String!): Student!
}
`,
      }
    );
    const myApi_apiKey: appsync.CfnApiKey = new appsync.CfnApiKey(
      this,
      "apiKey",
      {
        apiId: myApi_appsync.attrApiId,
      }
    );
    const myApi_serviceRole: iam.Role = new iam.Role(
      this,
      "appsyncServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      }
    );
    myApi_serviceRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    const ds_myApi_addStudent: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myApidataSourceGraphqladdStudent"
          : "myApidataSourceGraphqladdStudent",
        {
          name: props?.prod
            ? props?.prod + "myApi_dataSource_addStudent"
            : "myApi_dataSource_addStudent",
          apiId: myApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myApi_lambdaFn_addStudentArn,
          },
          serviceRoleArn: myApi_serviceRole.roleArn,
        }
      );
    const ds_myApi_student: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      props?.prod
        ? props?.prod + "myApidataSourceGraphqlstudent"
        : "myApidataSourceGraphqlstudent",
      {
        name: props?.prod
          ? props?.prod + "myApi_dataSource_student"
          : "myApi_dataSource_student",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.myApi_lambdaFn_studentArn },
        serviceRoleArn: myApi_serviceRole.roleArn,
      }
    );
    const student_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "student_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "student",
        dataSourceName: ds_myApi_student.name,
      }
    );
    student_resolver.node.addDependency(myApi_schema);
    student_resolver.node.addDependency(ds_myApi_student);

    const addStudent_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "addStudent_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "addStudent",
        dataSourceName: ds_myApi_addStudent.name,
      }
    );
    addStudent_resolver.node.addDependency(myApi_schema);
    addStudent_resolver.node.addDependency(ds_myApi_addStudent);

    this.api_url = myApi_appsync.attrGraphQlUrl;
    this.api_key = myApi_apiKey.attrApiKey;
    new CfnOutput(
      this,
      props?.prod ? props.prod + "APIGraphQlURL" : "APIGraphQlURL",
      {
        value: myApi_appsync.attrGraphQlUrl,
        description: "The URL of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIURL"
          : "graphQlAPIURL",
      }
    );
    new CfnOutput(
      this,
      props?.prod ? props.prod + "GraphQLAPIKey" : "GraphQLAPIKey",
      {
        value: myApi_apiKey.attrApiKey || "",
        description: "The API Key of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIKey"
          : "graphQlAPIKey",
      }
    );
  }
}
