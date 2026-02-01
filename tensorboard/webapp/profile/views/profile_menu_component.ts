/* Copyright 2026 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {ProfileMetadata} from '../types';

@Component({
  selector: 'tb-profile-menu-component',
  template: `
    <button
      mat-button
      [matMenuTriggerFor]="profileMenu"
      class="profile-menu-trigger"
      [class.has-profile]="activeProfileName !== null"
    >
      <mat-icon>bookmark</mat-icon>
      <span class="label">
        {{ activeProfileName || 'Profiles' }}
        <span *ngIf="hasUnsavedChanges" class="unsaved-indicator">*</span>
      </span>
      <mat-icon>arrow_drop_down</mat-icon>
    </button>

    <mat-menu #profileMenu="matMenu" class="profile-menu">
      <!-- Save Section -->
      <div class="menu-section">
        <div class="section-header">Save</div>
        <button
          mat-menu-item
          (click)="onSaveClicked()"
          [disabled]="!activeProfileName"
        >
          <mat-icon>save</mat-icon>
          <span>Save Current</span>
        </button>
        <button mat-menu-item (click)="onSaveAsClicked()">
          <mat-icon>save_as</mat-icon>
          <span>Save As New...</span>
        </button>
      </div>

      <mat-divider></mat-divider>

      <!-- Load Section -->
      <div class="menu-section" *ngIf="profiles.length > 0">
        <div class="section-header">Load Profile</div>
        <button
          mat-menu-item
          *ngFor="let profile of profiles"
          (click)="onLoadProfile(profile.name)"
          [class.active]="profile.name === activeProfileName"
        >
          <mat-icon>{{
            profile.name === activeProfileName ? 'check' : 'description'
          }}</mat-icon>
          <span class="profile-name">{{ profile.name }}</span>
          <span class="profile-date">{{
            formatDate(profile.lastModifiedTimestamp)
          }}</span>
        </button>
      </div>

      <div class="menu-section empty-state" *ngIf="profiles.length === 0">
        <span class="empty-message">No saved profiles</span>
      </div>

      <mat-divider></mat-divider>

      <!-- Import/Export Section -->
      <div class="menu-section">
        <div class="section-header">Import/Export</div>
        <button mat-menu-item (click)="onExportClicked()">
          <mat-icon>download</mat-icon>
          <span>Export Profile...</span>
        </button>
        <button mat-menu-item (click)="onImportClicked()">
          <mat-icon>upload</mat-icon>
          <span>Import Profile...</span>
        </button>
      </div>

      <mat-divider></mat-divider>

      <!-- Manage Section -->
      <div class="menu-section">
        <button
          mat-menu-item
          (click)="onDeactivateClicked()"
          [disabled]="!activeProfileName"
        >
          <mat-icon>clear</mat-icon>
          <span>Deactivate Profile</span>
        </button>
        <button mat-menu-item [matMenuTriggerFor]="deleteMenu">
          <mat-icon>delete</mat-icon>
          <span>Delete Profile</span>
        </button>
      </div>
    </mat-menu>

    <!-- Delete Submenu -->
    <mat-menu #deleteMenu="matMenu">
      <button
        mat-menu-item
        *ngFor="let profile of profiles"
        (click)="onDeleteProfile(profile.name)"
      >
        <mat-icon>delete</mat-icon>
        <span>{{ profile.name }}</span>
      </button>
      <button
        mat-menu-item
        *ngIf="profiles.length > 0"
        (click)="onClearAllClicked()"
        class="danger-item"
      >
        <mat-icon>delete_sweep</mat-icon>
        <span>Clear All Profiles</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      .profile-menu-trigger {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .profile-menu-trigger.has-profile {
        color: var(--tb-primary);
      }

      .label {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .unsaved-indicator {
        color: var(--tb-warning);
        font-weight: bold;
      }

      .menu-section {
        padding: 8px 0;
      }

      .section-header {
        padding: 4px 16px;
        font-size: 12px;
        font-weight: 500;
        color: var(--tb-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .profile-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .profile-date {
        font-size: 11px;
        color: var(--tb-text-secondary);
        margin-left: 16px;
      }

      .active {
        background-color: var(--tb-selected-bg);
      }

      .empty-state {
        padding: 16px;
        text-align: center;
      }

      .empty-message {
        color: var(--tb-text-secondary);
        font-size: 13px;
      }

      .danger-item {
        color: var(--tb-error);
      }

      ::ng-deep .profile-menu {
        min-width: 280px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent {
  @Input() profiles: ProfileMetadata[] = [];
  @Input() activeProfileName: string | null = null;
  @Input() hasUnsavedChanges: boolean = false;

  @Output() save = new EventEmitter<string>();
  @Output() saveAs = new EventEmitter<void>();
  @Output() load = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() export = new EventEmitter<void>();
  @Output() import = new EventEmitter<void>();
  @Output() deactivate = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  onSaveClicked(): void {
    if (this.activeProfileName) {
      this.save.emit(this.activeProfileName);
    }
  }

  onSaveAsClicked(): void {
    this.saveAs.emit();
  }

  onLoadProfile(name: string): void {
    this.load.emit(name);
  }

  onDeleteProfile(name: string): void {
    this.delete.emit(name);
  }

  onExportClicked(): void {
    this.export.emit();
  }

  onImportClicked(): void {
    this.import.emit();
  }

  onDeactivateClicked(): void {
    this.deactivate.emit();
  }

  onClearAllClicked(): void {
    this.clearAll.emit();
  }
}
