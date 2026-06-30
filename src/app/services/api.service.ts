import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ===== Schedule GraphQL only =====
const GET_SCHEDULES = gql`
  query {
    schedules {
      id
      day
      start_time
      end_time
      room
      instructor
      students {
        id
        name
      }
    }
  }
`;

const CREATE_SCHEDULE = gql`
  mutation CreateSchedule(
    $day: String!
    $start_time: String!
    $end_time: String!
    $room: String!
    $instructor: String!
  ) {
    createSchedule(
      day: $day
      start_time: $start_time
      end_time: $end_time
      room: $room
      instructor: $instructor
    ) {
      id
      day
    }
  }
`;

const UPDATE_SCHEDULE = gql`
  mutation UpdateSchedule(
    $id: ID!
    $day: String
    $start_time: String
    $end_time: String
    $room: String
    $instructor: String
  ) {
    updateSchedule(
      id: $id
      day: $day
      start_time: $start_time
      end_time: $end_time
      room: $room
      instructor: $instructor
    ) {
      id
      day
    }
  }
`;

const DELETE_SCHEDULE = gql`
  mutation DeleteSchedule($id: ID!) {
    deleteSchedule(id: $id) {
      id
    }
  }
`;

const ASSIGN_STUDENT = gql`
  mutation AssignStudentToSchedule($student_id: ID!, $schedule_id: ID) {
    assignStudentToSchedule(student_id: $student_id, schedule_id: $schedule_id) {
      id
      name
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private apollo: Apollo
  ) {}

  // ===== REST - Students (Register, View, Update, Delete) =====
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

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/students`);
  }

  updateStudent(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/students/${id}`, data);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/students/${id}`);
  }

  // ===== GraphQL - Schedules only =====
  getSchedules(): Observable<any[]> {
    return this.apollo.watchQuery({ query: GET_SCHEDULES , pollInterval:500})
      .valueChanges.pipe(
        map((result: any) => {
          if (result.errors) {
            console.error('GraphQL System Errors:', result.errors);
          }
          return result.data ? result.data.schedules : [];
        })
      );
  }

  createSchedule(data: any): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_SCHEDULE,
      variables: data
    });
  }

  updateSchedule(id: number, data: any): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_SCHEDULE,
      variables: { id, ...data }
    });
  }

  deleteSchedule(id: number): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_SCHEDULE,
      variables: { id }
    });
  }

  assignStudentToSchedule(studentId: number, scheduleId: number | null): Observable<any> {
    return this.apollo.mutate({
      mutation: ASSIGN_STUDENT,
      variables: { student_id: studentId, schedule_id: scheduleId }
    });
  }
}

