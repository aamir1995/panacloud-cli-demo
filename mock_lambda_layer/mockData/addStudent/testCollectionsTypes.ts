import { Student, MutationAddStudentArgs, QueryStudentArgs } from "../types";

export type TestCollection = {
  fields: {
    addStudent: { arguments: MutationAddStudentArgs; response: Student }[];
  };
};
