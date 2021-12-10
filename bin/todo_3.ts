import * as cdk from "aws-cdk-lib";
import { Todo3Stack } from "../lib/todo_3-stack";
const app: cdk.App = new cdk.App();
const deployEnv = process.env.STAGE;
const stack = new Todo3Stack(
  app,
  deployEnv ? deployEnv + "-Todo3Stack" : "Todo3Stack",
  { prod: deployEnv }
);
