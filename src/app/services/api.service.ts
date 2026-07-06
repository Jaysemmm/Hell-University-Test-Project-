import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

//Schedule GraphQL only
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
  mutation AssignStudentToSchedule($user_id: ID!, $schedule_id: ID!) {
    assignStudentToSchedule(user_id: $user_id, schedule_id: $schedule_id) {
      id
      name
    }
  }
`;

const UNASSIGN_STUDENT = gql`
  mutation UnassignStudentFromSchedule($user_id: ID!, $schedule_id: ID!) {
    unassignStudentFromSchedule(user_id: $user_id, schedule_id: $schedule_id) {
      id
      name
    }
  }
`;

const IMPORT_STUDENTS_CSV = gql`
  mutation ImportStudentsCsv($file: Upload!) {
    importStudentsCsv(file: $file) {
      message
    }
  }
`;

const GET_STUDENT_REPORT = gql`
  query GetStudentReport($id: ID!) {
    student(id: $id) {
      id
      name
      email
      year_level
      department
      age
      birthday
      contact_number
      schedules {
        id
        day
        start_time
        end_time
        room
        instructor
      }
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
  exportStudents(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/students/export`, { responseType: 'blob' });
  }
 importBatch(file: File): Observable<any> {
  return this.apollo.mutate({
    mutation: IMPORT_STUDENTS_CSV,
    variables: { file }
  });
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

  assignStudentToSchedule(studentId: number, scheduleId: number) {
    return this.apollo.mutate({
      mutation: ASSIGN_STUDENT,
      variables: { user_id: studentId, schedule_id: scheduleId }
    });
  }

unassignStudentFromSchedule(studentId: number, scheduleId: number) {
    return this.apollo.mutate({
      mutation: UNASSIGN_STUDENT,
      variables: { user_id: studentId, schedule_id: scheduleId }
    });
  }


// ===== GraphQL - Student Report ===== //
getStudentReport(id: number): Observable<any> {
  return this.apollo.query({
    query: GET_STUDENT_REPORT,
    variables: { id },
    fetchPolicy: 'network-only',
  }).pipe(
    map((result: any) => result.data?.student ?? null)
  );
}

getStudentReportPdfUrl(id: number): string {
  return `${this.baseUrl}/students/${id}/report-pdf`;
}
}
