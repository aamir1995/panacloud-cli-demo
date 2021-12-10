import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../mock_lambda_layer/mockData/student/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(API_URL);
const { student } = require("./graphql/queries");
describe("run student", () => {
  it("student works correctly", (done) => {
    const totalFields = testCollections.fields.student.length;
    for (let index = 0; index < totalFields; index++) {
      let args = testCollections.fields.student[index].arguments;
      let response = testCollections.fields.student[index].response;
      request
        .post("/")
        .set("x-api-key", API_KEY)
        .send({ query: student, variables: args })
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          expect(res.status).to.equal(200);
          expect(res.body.data["student"]).to.eql(response);
          done();
        });
    }
  });
});
