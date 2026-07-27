import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  imports: [
    FormsModule, DatePipe,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatSnackBarModule, MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  displayedColumns = ['index', 'image', 'name', 'category', 'price', 'unique_id', 'created_at', 'actions'];

  loading = false;
  showForm = false;
  editMode = false;
  selectedId: number | null = null;

  // Filters
  search = '';
  categoryFilter = '';
  sortOrder = 'desc';
  page = 1;
  limit = 10;
  total = 0;

  // Form
  form = { name: '', price: '', category_id: '', image: null as File | null };
  imagePreview: string | null = null;
  apiUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.load();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(data => this.categories = data);
  }

  load() {
    this.loading = true;
    this.productService.getAll({
      page: this.page, limit: this.limit,
      search: this.search, category: this.categoryFilter,
      sortBy: 'price', order: this.sortOrder
    }).subscribe({
      next: (res: any) => { this.products = res.products; this.total = res.total; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onPageChange(e: PageEvent) {
    this.page = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.load();
  }

  onSearch() { this.page = 1; this.load(); }

  toggleSort() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.load();
  }

  openAdd() {
    this.editMode = false;
    this.form = { name: '', price: '', category_id: '', image: null };
    this.imagePreview = null;
    this.selectedId = null;
    this.showForm = true;
  }

  openEdit(p: any) {
    this.editMode = true;
    this.selectedId = p.id;
    this.form = { name: p.name, price: p.price, category_id: p.category_id, image: null };
    this.imagePreview = p.image ? `${this.apiUrl}${p.image}` : null;
    this.showForm = true;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.image = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  save() {
    if (!this.form.name || !this.form.price || !this.form.category_id) {
      this.snackbar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }
    const fd = new FormData();
    fd.append('name', this.form.name);
    fd.append('price', this.form.price);
    fd.append('category_id', this.form.category_id);
    if (this.form.image) fd.append('image', this.form.image);

    const obs = this.editMode
      ? this.productService.update(this.selectedId!, fd)
      : this.productService.create(fd);

    obs.subscribe({
      next: () => {
        this.snackbar.open(`Product ${this.editMode ? 'updated' : 'created'}!`, 'Close', { duration: 3000 });
        this.showForm = false;
        this.load();
      },
      error: (err) => this.snackbar.open(err.error?.message || 'Error', 'Close', { duration: 3000 })
    });
  }

  delete(id: number) {
    if (!confirm('Delete this product?')) return;
    this.productService.delete(id).subscribe({
      next: () => { this.snackbar.open('Product deleted', 'Close', { duration: 3000 }); this.load(); },
      error: () => this.snackbar.open('Error deleting', 'Close', { duration: 3000 })
    });
  }

  onBulkUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.productService.bulkUpload(file).subscribe({
      next: (res: any) => { this.snackbar.open(res.message, 'Close', { duration: 4000 }); this.load(); },
      error: () => this.snackbar.open('Bulk upload failed', 'Close', { duration: 3000 })
    });
  }

  downloadCSV() {
    this.productService.downloadCSV().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'products.csv'; a.click();
      URL.revokeObjectURL(url);
    });
  }

  downloadExcel() {
    this.productService.downloadExcel().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'products.xlsx'; a.click();
      URL.revokeObjectURL(url);
    });
  }

  cancel() { this.showForm = false; }
}
