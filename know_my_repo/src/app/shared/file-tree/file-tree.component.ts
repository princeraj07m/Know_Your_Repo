import {
  Component,
  input,
  computed,
  signal,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export interface TreeNode {
  name: string;
  fullPath: string;
  isFolder: boolean;
  depth: number;
  children: TreeNode[];
  expanded?: boolean;
}

@Component({
  selector: 'app-file-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-tree.component.html',
  styleUrl: './file-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('0.25s ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('0.2s ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class FileTreeComponent {
  readonly treeText = input<string>('');

  readonly nodes = computed(() => this.parseTree(this.treeText()));

  readonly expandedPaths = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const n = this.nodes();
      const paths = new Set<string>();
      const expand = (items: TreeNode[], maxDepth: number, d = 0) => {
        for (const node of items) {
          if (node.isFolder && d < maxDepth) {
            paths.add(node.fullPath);
            expand(node.children, maxDepth, d + 1);
          }
        }
      };
      expand(n, 2);
      this.expandedPaths.set(paths);
    });
  }

  getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    const iconMap: Record<string, string> = {
      js: 'fa-file-code',
      ts: 'fa-file-code',
      jsx: 'fa-file-code',
      tsx: 'fa-file-code',
      json: 'fa-file-code',
      html: 'fa-file-code',
      css: 'fa-file-code',
      scss: 'fa-file-code',
      md: 'fa-file-lines',
      py: 'fa-file-code',
      java: 'fa-file-code',
      go: 'fa-file-code',
      rs: 'fa-file-code',
    };
    return iconMap[ext] ?? 'fa-file';
  }

  toggleExpand(node: TreeNode): void {
    if (!node.isFolder) return;
    const path = node.fullPath;
    this.expandedPaths.update((set) => {
      const next = new Set(set);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  isExpanded(node: TreeNode): boolean {
    return this.expandedPaths().has(node.fullPath);
  }

  private parseTree(text: string): TreeNode[] {
    if (!text?.trim()) return [];

    const lines = text
      .split('\n')
      .map((l) => l.replace(/\s+$/u, ''))
      .filter((l) => l.trim().length > 0);

    if (lines.length === 0) return [];

    const entries = this.parseLines(lines);
    let [nodes] = this.buildTree(entries, 0, 0, '');

    if (nodes.length === 0 && lines.some((l) => /[\\/]/.test(l))) {
      nodes = this.buildTreeFromPaths(lines);
    }

    return nodes;
  }

  private buildTreeFromPaths(lines: string[]): TreeNode[] {
    type Entry = { node: TreeNode; children: Map<string, Entry> };
    const root = new Map<string, Entry>();

    for (const line of lines) {
      const cleaned = line.replace(/^[\s│├└\-*]+/, '').replace(/^[\s─]+/, '').trim();
      if (!cleaned || (!cleaned.includes('/') && !cleaned.includes('\\'))) continue;

      const parts = cleaned.replace(/^\.\//, '').split(/[\\/]/).filter(Boolean);
      let current = root;
      let fullPath = '';

      for (let i = 0; i < parts.length; i++) {
        const name = parts[i];
        fullPath = fullPath ? `${fullPath}/${name}` : name;
        const isFile = name.includes('.') && i === parts.length - 1;

        if (!current.has(name)) {
          const node: TreeNode = {
            name,
            fullPath,
            isFolder: !isFile,
            depth: i,
            children: [],
          };
          current.set(name, { node, children: new Map() });
        }

        if (i < parts.length - 1) {
          current = current.get(name)!.children;
        }
      }
    }

    const toTreeNodes = (map: Map<string, Entry>): TreeNode[] => {
      return Array.from(map.values()).map((entry) => {
        const node = entry.node;
        node.children = toTreeNodes(entry.children);
        node.isFolder = node.children.length > 0 || !node.name.includes('.');
        return node;
      });
    };

    return toTreeNodes(root);
  }

  private parseLines(lines: string[]): { name: string; depth: number }[] {
    const result: { name: string; depth: number }[] = [];

    for (const line of lines) {
      const match = line.match(/^([\s│├└\-*]*)(.*)$/);
      if (!match) continue;

      const rawName = match[2]
        .replace(/^[\s─]+/, '')
        .replace(/^\.\//, '')
        .trim();
      if (!rawName || rawName === '.') continue;

      const name = rawName.replace(/\/$/, '');
      const prefix = match[1];
      const indentUnits = prefix.replace(/[├└]/g, '│').replace(/─/g, ' ');
      const hasTreeChars = /[│├└]/.test(prefix);
      const depth = hasTreeChars
        ? Math.floor(indentUnits.length / 4)
        : Math.floor(indentUnits.length / 2);

      result.push({ name, depth });
    }

    return result;
  }

  private buildTree(
    entries: { name: string; depth: number }[],
    start: number,
    currentDepth: number,
    parentPath: string
  ): [TreeNode[], number] {
    const nodes: TreeNode[] = [];
    let i = start;

    while (i < entries.length) {
      const { name, depth } = entries[i];
      if (depth < currentDepth) break;

      const fullPath = parentPath ? `${parentPath}/${name}` : name;
      const hasChildren = i + 1 < entries.length && entries[i + 1].depth > depth;
      const isFolder = hasChildren || name.endsWith('/');

      const node: TreeNode = {
        name,
        fullPath,
        isFolder,
        depth: currentDepth,
        children: [],
      };

      if (isFolder && hasChildren) {
        const [children, nextIdx] = this.buildTree(
          entries,
          i + 1,
          depth + 1,
          fullPath
        );
        node.children = children;
        i = nextIdx;
      } else {
        i++;
      }

      nodes.push(node);
    }

    return [nodes, i];
  }
}
