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

  selectedFile: File | null = null;

  onCsvFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.csvFileName.set(file.name);
    this.importSummary.set('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        this.csvRows.set(result.data as any[]); // still used for preview only
      },
      error: (err: any) => {
        this.importSummary.set('Failed to read CSV file: ' + err.message);
      }
    });
  }
importStudents() {
    const file = this.selectedFile;
    if (!file) return;

    this.isImporting.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.api.importBatch(formData).subscribe({
      next: (res: any) => {
        this.isImporting.set(false);
        this.importSummary.set(res.message || 'Import queued successfully.');
        setTimeout(() => this.loadStudents(), 3000); // give the worker a few seconds
      },
      error: (err) => {
        this.isImporting.set(false);
        this.importSummary.set('Import failed: ' + (err.error?.message || 'Unknown error'));
      }
    });
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

  selectedIds = signal<Set<number>>(new Set());

  toggleSelect(id: number) {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  toggleSelectAll() {
    const allIds = this.filteredStudents().map(s => s.id);
    const allSelected = allIds.every(id => this.selectedIds().has(id));
    if (allSelected) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(allIds));
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  isAllSelected(): boolean {
    const allIds = this.filteredStudents().map(s => s.id);
    return allIds.length > 0 && allIds.every(id => this.selectedIds().has(id));
  }
  showBulkDeleteModal = signal(false);

  openBulkDeleteModal() {
    if (this.selectedIds().size > 0) {
      this.showBulkDeleteModal.set(true);
    }
  }

  closeBulkDeleteModal() {
    this.showBulkDeleteModal.set(false);
  }

  confirmBulkDelete() {
    const ids = Array.from(this.selectedIds());
    let completed = 0;

    ids.forEach(id => {
      this.api.deleteStudent(id).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) {
            this.selectedIds.set(new Set());
            this.showBulkDeleteModal.set(false);
            this.loadStudents();
          }
        },
        error: (err) => {
          console.error(`Failed to delete student ${id}:`, err);
          completed++;
          if (completed === ids.length) {
            this.selectedIds.set(new Set());
            this.showBulkDeleteModal.set(false);
            this.loadStudents();
          }
        }
      });
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