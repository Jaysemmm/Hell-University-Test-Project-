import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

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
  showmodal = signal(false);

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  goHome() {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
  this.api.getStudents().subscribe({
    next: (data) => {
      this.students.set(data);
      this.isLoading.set(false);
      console.log('Students loaded via GraphQL!', data);
    },
    error: (err) => {
      this.errorMsg.set('Failed to load students!');
      this.isLoading.set(false);
      console.error('GraphQL Error:', err);
    }
  });
}
  editStudent(student: any) {
    this.selectedStudent.set({ ...student });
    this.showmodal.set(true);
  }

  saveStudent() {
    const student = this.selectedStudent();
    this.api.updateStudent(student.id, student).subscribe({
      next: () => {
        this.loadStudents();
        this.showmodal.set(false);
        console.log('Student updated!');
      },
      error: (err) => {
        console.error('Error updating student:', err);
      }
    });
  }

  deleteStudent(id: number) {
    if (confirm('Are you sure you want to delete this student?')) {
      this.api.deleteStudent(id).subscribe({
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
}
