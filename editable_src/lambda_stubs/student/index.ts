var axios = require("axios");

import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import {
  Student,
  MutationAddStudentArgs,
  QueryStudentArgs,
} from "../../customMockLambdaLayer/mockData/types";
const db = require("data-api-client")({
  secretArn: process.env.SECRET_ARN,
  resourceArn: process.env.CLUSTER_ARN,
  database: process.env.DB_NAME,
});

let allStudents = [{id: 1, name: "Mohsin"}, {id: 2, name: 'Aamir'}, {id:3, name: 'Daniyal'}];
exports.handler = async (event: AppSyncResolverEvent<QueryStudentArgs>) => {
 
  console.log("event.arguments>>>>", event.arguments)
  const { id } = event.arguments;

  return allStudents.find(x=> x.id.toString() == id?.toString());
};
