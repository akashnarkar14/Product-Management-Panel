import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard' },
    { label: 'Categories', icon: 'category', route: '/app/categories' },
    { label: 'Products', icon: 'inventory_2', route: '/app/products' },
  ];

  isMobile = window.innerWidth <= 768;
  sidenavOpened = !this.isMobile;
  sidenavMode: 'side' | 'over' = this.isMobile ? 'over' : 'side';

  constructor(public auth: AuthService) {}

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    this.sidenavMode = this.isMobile ? 'over' : 'side';
    this.sidenavOpened = !this.isMobile;
  }

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout() {
    this.auth.logout();
  }
}
