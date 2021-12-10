import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../mock_lambda_layer/mockData/addStudent/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(API_URL);
const { addStudent } = require("./graphql/mutations");
describe("run addStudent", () => {
  it("addStudent works correctly", (done) => {
    const totalFields = testCollections.fields.addStudent.length;
    for (let index = 0; index < totalFields; index++) {
      let args = testCollections.fields.addStudent[index].arguments;
      let response = testCollections.fields.addStudent[index].response;
      request
        .post("/")
        .set("x-api-key", API_KEY)
        .send({ query: addStudent, variables: args })
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          expect(res.status).to.equal(200);
          expect(res.body.data["addStudent"]).to.eql(response);
          done();
        });
    }
  });
});
