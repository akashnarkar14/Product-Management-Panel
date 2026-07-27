import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  userName = '';

  stats = [
    { label: 'Total Products', value: 0, icon: 'inventory_2', color: '#1976d2', route: '/app/products' },
    { label: 'Total Categories', value: 0, icon: 'category', color: '#388e3c', route: '/app/categories' },
    { label: 'Bulk Upload', value: 'CSV', icon: 'upload_file', color: '#f57c00', route: '/app/products' },
    { label: 'Reports', value: 'Excel', icon: 'assessment', color: '#7b1fa2', route: '/app/products' },
  ];

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userName = this.auth.getUser()?.email || '';
    this.loadStats();
  }

  loadStats() {
    this.categoryService.getAll().subscribe({
      next: (cats) => { this.stats[1].value = cats.length; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.productService.getAll({ limit: 1 }).subscribe({
      next: (res: any) => { this.stats[0].value = res.total; this.cdr.detectChanges(); },
      error: () => {}
    });
  }
}
