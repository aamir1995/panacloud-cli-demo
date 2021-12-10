import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { AuroraDBConstruct } from "./AuroraDBConstruct";
import { AspectController } from "../editable_src/aspects/AspectController";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

interface EnvProps {
  prod?: string;
}

export class Todo3Stack extends Stack {
  constructor(scope: Construct, id: string, props?: EnvProps) {
    super(scope, id);

    const myApi_auroradb: AuroraDBConstruct = new AuroraDBConstruct(
      this,
      "AuroraDBConstruct",
      { prod: props?.prod }
    );
    const myApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("editable_src/lambdaLayer"),
      }
    );
    const myApi_mock_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myApiMockLambdaLayer",
      {
        code: lambda.Code.fromAsset("mock_lambda_layer"),
      }
    );
    const myApi_lambdaFn_student: lambda.Function = new lambda.Function(
      this,
      "myApiLambdastudent",
      {
        functionName: props?.prod
          ? props?.prod + "-myApiLambdastudent"
          : "myApiLambdastudent",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/student"),
        layers: [myApi_mock_lambdaLayer],
        role: myApi_auroradb.serviceRole,
        vpc: myApi_auroradb.vpcRef,

        environment: {
          SECRET_ARN: myApi_auroradb.SECRET_ARN,
          CLUSTER_ARN: myApi_auroradb.CLUSTER_ARN,
          DB_NAME: myApi_auroradb.DB_NAME,
        },
      }
    );
    myApi_auroradb.db_cluster.grantDataApiAccess(myApi_lambdaFn_student);

    const myApi_lambdaFn_addStudent: lambda.Function = new lambda.Function(
      this,
      "myApiLambdaaddStudent",
      {
        functionName: props?.prod
          ? props?.prod + "-myApiLambdaaddStudent"
          : "myApiLambdaaddStudent",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/addStudent"),
        layers: [myApi_mock_lambdaLayer],
        role: myApi_auroradb.serviceRole,
        vpc: myApi_auroradb.vpcRef,

        environment: {
          SECRET_ARN: myApi_auroradb.SECRET_ARN,
          CLUSTER_ARN: myApi_auroradb.CLUSTER_ARN,
          DB_NAME: myApi_auroradb.DB_NAME,
        },
      }
    );
    myApi_auroradb.db_cluster.grantDataApiAccess(myApi_lambdaFn_addStudent);

    const myApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "myApiAppsyncConstruct",
      {
        myApi_lambdaFn_studentArn: myApi_lambdaFn_student.functionArn,
        myApi_lambdaFn_addStudentArn: myApi_lambdaFn_addStudent.functionArn,
        prod: props?.prod,
      }
    );
    new AspectController(this, props?.prod);
  }
}
