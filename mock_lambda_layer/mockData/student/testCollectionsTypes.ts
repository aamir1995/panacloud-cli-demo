import { Student, MutationAddStudentArgs, QueryStudentArgs } from "../types";

export type TestCollection = {
  fields: { student: { arguments: QueryStudentArgs; response: Student }[] };
};
