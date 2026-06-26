import { Component, OnInit,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; //
import { ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Students implements OnInit {
  students = signal<any[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  selectedStudent = signal<any>(null);
  showmodal= signal(false);

   private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}



   ngOnInit() {
    this.loadStudents();
   }

   loadStudents(){
    this.http.get<any[]>(`${this.apiUrl}/students`).subscribe({
      next: (data) => {
        this.students.set(data);
        this.isLoading.set(false);
        console.log('Students loaded!', data);
      },
      error: (err) => {
        this.errorMsg.set('Failed to load students!');
        this.isLoading.set(false);
        console.error('Error fetching students:', err);
      }
    });
  }

  editstudent(student: any) {
    this.selectedStudent.set({...student});
    this.showmodal.set(true);
  }

  saveStudent(){
    const student = this.selectedStudent();
    this.http.put(`${this.apiUrl}/students/${student.id}`, student).subscribe({
      next: () => {
        this.loadStudents();
        this.showmodal.set(false);
        console.log('Student updated!');
      },
      error: (err) => {
        console.error ('Error Updating Students',err);
      }
  });
}

deleteStudent(id: number) {
    if (confirm('Are you sure you want to delete this student?')) {
      this.http.delete(`${this.apiUrl}/students/${id}`).subscribe({
        next: () => {
          this.loadStudents();
          console.log('Student deleted!');
        },
        error: (err) => {
          console.error('Error deleting student:', err);
        }
      });
    }
  }

  closeModal() {
    this.showmodal.set(false);
  }
  goHome() {
    this.router.navigate(['/']);
  }
}
