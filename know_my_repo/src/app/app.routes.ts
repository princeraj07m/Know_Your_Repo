import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'upload', loadComponent: () => import('./features/upload/upload-page.component').then(m => m.UploadPageComponent) },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
      { path: 'architecture', loadComponent: () => import('./features/architecture/architecture-page.component').then(m => m.ArchitecturePageComponent) },
      { path: 'workflow', loadComponent: () => import('./features/workflow/workflow-page.component').then(m => m.WorkflowPageComponent) },
      { path: 'components', loadComponent: () => import('./features/components/components-page.component').then(m => m.ComponentsPageComponent) },
      { path: 'insights', loadComponent: () => import('./features/insights/insights-page.component').then(m => m.InsightsPageComponent) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
