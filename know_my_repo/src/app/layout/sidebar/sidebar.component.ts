import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface SidebarItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly collapsed = input<boolean>(false);
  readonly visible = input<boolean>(true);
  readonly linkClicked = output<void>();
  readonly collapsedChange = output<boolean>();

  readonly navItems: SidebarItem[] = [
    { label: 'Overview', route: '/dashboard', icon: 'fa-chart-pie' },
    { label: 'Upload', route: '/upload', icon: 'fa-upload' },
    { label: 'Architecture', route: '/architecture', icon: 'fa-sitemap' },
    { label: 'Workflow', route: '/workflow', icon: 'fa-diagram-project' },
    { label: 'Components', route: '/components', icon: 'fa-cubes' },
    { label: 'Insights', route: '/insights', icon: 'fa-lightbulb' }
  ];

  onLinkClick(): void {
    this.linkClicked.emit();
  }

  onCollapseClick(): void {
    this.collapsedChange.emit(!this.collapsed());
  }
}
