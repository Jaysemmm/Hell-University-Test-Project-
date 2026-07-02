import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import * as Papa from 'papaparse';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBar],
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

  // Search
  searchTerm = signal('');
  filteredStudents = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.students();
    return this.students().filter(s =>
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  });

  // CSV import state
csvFileName = signal('');
  csvRows = signal<any[]>([]);
  isImporting = signal(false);
  importSummary = signal('');
  importErrors = signal<string[]>([]);
  importSuccessCount = signal(0);
  showImportModal = signal(false);
  showExportModal = signal(false);

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }
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

  // ===== CSV Import =====

  onCsvFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.csvFileName.set(file.name);
    this.importSummary.set('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        this.csvRows.set(result.data as any[]);
        console.log('Parsed CSV rows:', result.data);
      },
      error: (err: any) => {
        this.importSummary.set('Failed to read CSV file: ' + err.message);
      }
    });
  }

  importStudents() {
    const rows = this.csvRows();
    if (rows.length === 0) return;

    this.isImporting.set(true);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];
    let processed = 0;

    rows.forEach((row, index) => {
      const student = {
        name: row.name?.trim(),
        email: row.email?.trim(),
        year_level: row.year_level?.trim(),
        department: row.department?.trim(),
        age: Number(row.age),
        birthday: row.birthday?.trim(),
        contact_number: row.contact_number?.trim()
      };

      this.api.register(student).subscribe({
        next: () => {
          successCount++;
          processed++;
          this.checkImportDone(processed, rows.length, successCount, failCount, errors);
        },
        error: (err) => {
          failCount++;
          processed++;
          const msg = err.error?.message || 'Unknown error';
          errors.push(`Row ${index + 2} (${student.email || 'no email'}): ${msg}`);
          this.checkImportDone(processed, rows.length, successCount, failCount, errors);
        }
      });
    });
  }

 private checkImportDone(processed: number, total: number, successCount: number, failCount: number, errors: string[]) {
    if (processed === total) {
      this.isImporting.set(false);
      this.importSuccessCount.set(successCount);
      this.importErrors.set(errors);
      this.importSummary.set(`${successCount} succeeded, ${failCount} failed.`);
      this.loadStudents();
    }
  }
  exportStudents() {
    this.api.exportStudents().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Export failed:', err);
      }
    });
  }
  openImportModal() {
    this.showImportModal.set(true);
  }

 closeImportModal() {
    this.showImportModal.set(false);
    this.csvFileName.set('');
    this.csvRows.set([]);
    this.importSummary.set('');
    this.importErrors.set([]);
    this.importSuccessCount.set(0);
  }

  openExportModal() {
    this.showExportModal.set(true);
  }

  closeExportModal() {
    this.showExportModal.set(false);
  }

  confirmExport() {
    this.exportStudents();
    this.closeExportModal();
  }
}