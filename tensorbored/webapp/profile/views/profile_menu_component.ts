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
      mat-icon-button
      [matMenuTriggerFor]="profileMenu"
      class="profile-menu-trigger"
      [class.has-profile]="activeProfileName !== null"
      [class.has-unsaved]="hasUnsavedChanges"
      [title]="activeProfileName ? 'Profile: ' + activeProfileName + (hasUnsavedChanges ? ' (unsaved)' : '') : 'Profiles'"
    >
      <mat-icon>bookmark</mat-icon>
      <span *ngIf="hasUnsavedChanges" class="unsaved-dot"></span>
    </button>

    <mat-menu #profileMenu="matMenu" class="profile-menu">
      <!-- Active Profile Header -->
      <div class="menu-header" *ngIf="activeProfileName">
        <span class="active-profile-label">Active:</span>
        <span class="active-profile-name">{{ activeProfileName }}</span>
        <span *ngIf="hasUnsavedChanges" class="unsaved-badge">unsaved</span>
      </div>
      <mat-divider *ngIf="activeProfileName"></mat-divider>

      <!-- Save Section -->
      <button
        mat-menu-item
        (click)="onSaveClicked()"
        [disabled]="!activeProfileName"
      >
        <mat-icon>save</mat-icon>
        <span>Save</span>
      </button>
      <button mat-menu-item (click)="onSaveAsClicked()">
        <mat-icon>save_as</mat-icon>
        <span>Save As...</span>
      </button>

      <mat-divider></mat-divider>

      <!-- Load Section -->
      <div class="menu-section-label" *ngIf="profiles.length > 0">
        Saved Profiles
      </div>
      <button
        mat-menu-item
        *ngFor="let profile of profiles"
        (click)="onLoadProfile(profile.name)"
        [class.active-item]="profile.name === activeProfileName"
      >
        <mat-icon>{{
          profile.name === activeProfileName ? 'check' : 'description'
        }}</mat-icon>
        <span class="profile-item-content">
          <span class="profile-name">{{ profile.name }}</span>
          <span class="profile-date">{{ formatDate(profile.lastModifiedTimestamp) }}</span>
        </span>
      </button>
      <div class="empty-message" *ngIf="profiles.length === 0">
        No saved profiles
      </div>

      <mat-divider></mat-divider>

      <!-- Import/Export -->
      <button
        mat-menu-item
        (click)="onExportClicked()"
        [disabled]="!activeProfileName"
      >
        <mat-icon>download</mat-icon>
        <span>Export</span>
      </button>
      <button mat-menu-item (click)="onImportClicked()">
        <mat-icon>upload</mat-icon>
        <span>Import...</span>
      </button>

      <mat-divider></mat-divider>

      <!-- Manage -->
      <button
        mat-menu-item
        (click)="onDeactivateClicked()"
        [disabled]="!activeProfileName"
      >
        <mat-icon>clear</mat-icon>
        <span>Deactivate</span>
      </button>
      <button
        mat-menu-item
        [matMenuTriggerFor]="deleteMenu"
        [disabled]="profiles.length === 0"
      >
        <mat-icon>delete</mat-icon>
        <span>Delete...</span>
      </button>
    </mat-menu>

    <!-- Delete Submenu -->
    <mat-menu #deleteMenu="matMenu">
      <button
        mat-menu-item
        *ngFor="let profile of profiles"
        (click)="onDeleteProfile(profile.name)"
      >
        <mat-icon>delete_outline</mat-icon>
        <span>{{ profile.name }}</span>
      </button>
      <mat-divider *ngIf="profiles.length > 0"></mat-divider>
      <button
        mat-menu-item
        *ngIf="profiles.length > 0"
        (click)="onClearAllClicked()"
        class="danger-item"
      >
        <mat-icon>delete_sweep</mat-icon>
        <span>Clear All</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      .profile-menu-trigger {
        position: relative;
      }

      .profile-menu-trigger.has-profile {
        color: var(--tb-primary, #1976d2);
      }

      .profile-menu-trigger.has-unsaved .unsaved-dot {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--tb-warning, #ff9800);
      }

      .menu-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: var(--tb-bg-secondary, #f5f5f5);
      }

      .active-profile-label {
        font-size: 12px;
        color: var(--tb-text-secondary, #666);
      }

      .active-profile-name {
        font-weight: 500;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .unsaved-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--tb-warning, #ff9800);
        color: white;
      }

      .menu-section-label {
        font-size: 11px;
        font-weight: 500;
        color: var(--tb-text-secondary, #666);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 16px 4px;
      }

      .profile-item-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }

      .profile-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
      }

      .profile-date {
        font-size: 11px;
        color: var(--tb-text-secondary, #888);
      }

      .active-item {
        background-color: var(--tb-selected-bg, rgba(25, 118, 210, 0.08));
      }

      .empty-message {
        padding: 12px 16px;
        color: var(--tb-text-secondary, #888);
        font-size: 13px;
        font-style: italic;
      }

      .danger-item {
        color: var(--tb-error, #d32f2f);
      }

      ::ng-deep .profile-menu {
        min-width: 240px;
        max-width: 320px;
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
