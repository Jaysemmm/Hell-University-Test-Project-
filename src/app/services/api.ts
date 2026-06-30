import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// GraphQL Queries and Mutations
const GET_STUDENTS = gql`
  query {
    students {
      id
      name
      email
      year_level
      department
      age
      birthday
      contact_number
    }
  }
`;

const UPDATE_STUDENT = gql`
  mutation UpdateStudent(
    $id: ID!
    $name: String
    $email: String
    $year_level: String
    $department: String
    $age: Int
    $birthday: String
    $contact_number: String
  ) {
    updateStudent(
      id: $id
      name: $name
      email: $email
      year_level: $year_level
      department: $department
      age: $age
      birthday: $birthday
      contact_number: $contact_number
    ) {
      id
      name
      email
    }
  }
`;

const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,  // Keep for REST
    private apollo: Apollo      //  Add for GraphQL
  ) {}

  // REST - Register (stays as REST)
  register(data: {
    name: string;
    email: string;
    year_level: string;
    department: string;
    age: number;
    birthday: string;
    contact_number: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  //  GraphQL - Get all students
  getStudents(): Observable<any[]> {
    return this.apollo.watchQuery({ query: GET_STUDENTS })
      .valueChanges.pipe(
        map((result: any) => result.data.students)
      );
  }

  // GraphQL - Update student
  updateStudent(id: number, data: any): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_STUDENT,
      variables: { id, ...data }
    });
  }

  //  GraphQL - Delete student
  deleteStudent(id: number): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_STUDENT,
      variables: { id }
    });
  }
}
