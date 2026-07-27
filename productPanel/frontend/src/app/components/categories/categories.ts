import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoryService } from '../../services/category';

@Component({
  selector: 'app-categories',
  imports: [
    FormsModule, DatePipe,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  categories: any[] = [];
  displayedColumns = ['index', 'unique_id', 'name', 'created_at', 'actions'];
  loading = false;
  showForm = false;
  editMode = false;
  selectedId: number | null = null;
  formName = '';

  constructor(private categoryService: CategoryService, private snackbar: MatSnackBar, private cdr: ChangeDetectorRef) { }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => { this.categories = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openAdd() {
    this.editMode = false;
    this.formName = '';
    this.selectedId = null;
    this.showForm = true;
  }

  openEdit(cat: any) {
    this.editMode = true;
    this.formName = cat.name;
    this.selectedId = cat.id;
    this.showForm = true;
  }

  save() {
    if (!this.formName.trim()) {
      this.snackbar.open('Category name is required', 'Close', { duration: 3000 });
      return;
    }
    const obs = this.editMode
      ? this.categoryService.update(this.selectedId!, { name: this.formName })
      : this.categoryService.create({ name: this.formName });

    obs.subscribe({
      next: () => {
        this.snackbar.open(`Category ${this.editMode ? 'updated' : 'created'}!`, 'Close', { duration: 3000 });
        this.showForm = false;
        this.load();
      },
      error: (err) => this.snackbar.open(err.error?.message || 'Error', 'Close', { duration: 3000 })
    });
  }

  delete(id: number) {
    if (!confirm('Delete this category?')) return;
    this.categoryService.delete(id).subscribe({
      next: () => { this.snackbar.open('Category deleted', 'Close', { duration: 3000 }); this.load(); },
      error: () => this.snackbar.open('Error deleting', 'Close', { duration: 3000 })
    });
  }

  cancel() { this.showForm = false; }
}
