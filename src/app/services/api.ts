import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // ✅ One place to change the URL
  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // ✅ Handle errors in one place
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  // ✅ Register student
  register(data: {
    name: string;
    email: string;
    year_level: string;
    department: string;
    age: number;
    birthday: string;
    contact_number: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data)
      .pipe(catchError(this.handleError));
  }

  // ✅ Get all students
  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/students`)
      .pipe(catchError(this.handleError));
  }

  // ✅ Update student
  updateStudent(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/students/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  // ✅ Delete student
  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/students/${id}`)
      .pipe(catchError(this.handleError));
  }
}
