import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-student-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-report.html',
  styleUrl: './student-report.css'
})
export class StudentReport implements OnInit {
  students = signal<any[]>([]);
  searchTerm = signal('');
  selectedStudentId = signal<number | null>(null);
  report = signal<any>(null);
  isLoading = signal(false);
  today = new Date();

  filteredStudents = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.students();
    return this.students().filter(s =>
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  });

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.api.getStudents().subscribe({
      next: (data) => this.students.set(data),
      error: (err) => console.error('Error loading students:', err)
    });
  }

  onSelectStudent(id: number) {
    if (!id) {
      this.report.set(null);
      return;
    }
    this.selectedStudentId.set(id);
    this.isLoading.set(true);

    this.api.getStudentReport(id).subscribe({
      next: (data) => {
        this.report.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.isLoading.set(false);
      }
    });
  }

  printReport() {
    window.print();
  }

  downloadPdfReport() {
    const studentId = this.selectedStudentId();
    if (!studentId) return;
  window.open(this.api.getStudentReportPdfUrl(studentId), '_blank');
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
