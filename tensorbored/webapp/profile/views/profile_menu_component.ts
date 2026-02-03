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
      [title]="
        activeProfileName
          ? 'Profile: ' +
            activeProfileName +
            (hasUnsavedChanges ? ' (unsaved)' : '')
          : 'Profiles'
      "
    >
      <mat-icon svgIcon="settings_24px"></mat-icon>
      <span *ngIf="hasUnsavedChanges" class="unsaved-dot"></span>
    </button>

    <mat-menu #profileMenu="matMenu" class="profile-menu">
      <!-- Active Profile Header -->
      <div
        class="menu-header"
        *ngIf="activeProfileName"
        (click)="$event.stopPropagation()"
      >
        <span class="active-profile-label">Active:</span>
        <span class="active-profile-name">{{ activeProfileName }}</span>
        <span *ngIf="hasUnsavedChanges" class="unsaved-badge">*</span>
      </div>
      <mat-divider *ngIf="activeProfileName"></mat-divider>

      <!-- Save Section -->
      <button
        mat-menu-item
        (click)="onSaveClicked()"
        [disabled]="!activeProfileName"
      >
        <mat-icon svgIcon="done_24px"></mat-icon>
        <span>Save</span>
      </button>
      <button mat-menu-item (click)="onSaveAsClicked()">
        <mat-icon svgIcon="edit_24px"></mat-icon>
        <span>Save As...</span>
      </button>

      <mat-divider></mat-divider>

      <!-- Load Section -->
      <div
        class="menu-section-label"
        *ngIf="profiles.length > 0"
        (click)="$event.stopPropagation()"
      >
        Saved Profiles
      </div>
      <button
        mat-menu-item
        *ngFor="let profile of profiles"
        (click)="onLoadProfile(profile.name)"
        [class.active-item]="profile.name === activeProfileName"
      >
        <mat-icon
          [svgIcon]="
            profile.name === activeProfileName ? 'done_24px' : 'settings_24px'
          "
        ></mat-icon>
        <span class="profile-item-content">
          <span class="profile-name">{{ profile.name }}</span>
          <span class="profile-date">{{
            formatDate(profile.lastModifiedTimestamp)
          }}</span>
        </span>
      </button>
      <div
        class="empty-message"
        *ngIf="profiles.length === 0"
        (click)="$event.stopPropagation()"
      >
        No saved profiles
      </div>

      <mat-divider></mat-divider>

      <!-- View/Export/Import -->
      <button mat-menu-item (click)="onViewClicked()">
        <mat-icon svgIcon="info_outline_24px"></mat-icon>
        <span>View JSON...</span>
      </button>
      <button mat-menu-item (click)="onExportClicked()">
        <mat-icon svgIcon="get_app_24px"></mat-icon>
        <span>Export JSON</span>
      </button>
      <button mat-menu-item (click)="onImportClicked()">
        <mat-icon svgIcon="open_in_new_24px"></mat-icon>
        <span>Import...</span>
      </button>

      <mat-divider></mat-divider>

      <!-- Manage -->
      <button
        mat-menu-item
        (click)="onDeactivateClicked()"
        [disabled]="!activeProfileName"
      >
        <mat-icon svgIcon="close_24px"></mat-icon>
        <span>Deactivate</span>
      </button>
      <button
        mat-menu-item
        [matMenuTriggerFor]="deleteMenu"
        [disabled]="profiles.length === 0"
      >
        <mat-icon svgIcon="clear_24px"></mat-icon>
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
        <mat-icon svgIcon="clear_24px"></mat-icon>
        <span>{{ profile.name }}</span>
      </button>
      <mat-divider *ngIf="profiles.length > 0"></mat-divider>
      <button
        mat-menu-item
        *ngIf="profiles.length > 0"
        (click)="onClearAllClicked()"
        class="danger-item"
      >
        <mat-icon svgIcon="clear_24px"></mat-icon>
        <span>Clear All</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
      }

      .profile-menu-trigger {
        position: relative;
      }

      .profile-menu-trigger mat-icon {
        color: white;
      }

      .profile-menu-trigger.has-profile mat-icon {
        color: #ffb74d;
      }

      .unsaved-dot {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #f44336;
      }

      .menu-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(0, 0, 0, 0.04);
        min-height: 32px;
      }

      .active-profile-label {
        font-size: 12px;
        color: #666;
      }

      .active-profile-name {
        font-weight: 500;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 180px;
      }

      .unsaved-badge {
        font-size: 14px;
        font-weight: bold;
        color: #f44336;
      }

      .menu-section-label {
        font-size: 11px;
        font-weight: 500;
        color: #666;
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
        max-width: 180px;
      }

      .profile-date {
        font-size: 11px;
        color: #888;
      }

      .active-item {
        background-color: rgba(255, 152, 0, 0.1);
      }

      .empty-message {
        padding: 12px 16px;
        color: #888;
        font-size: 13px;
        font-style: italic;
      }

      .danger-item {
        color: #d32f2f;
      }

      ::ng-deep .profile-menu {
        min-width: 220px;
        max-width: 300px;
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
  @Output() viewJson = new EventEmitter<void>();
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

  onViewClicked(): void {
    this.viewJson.emit();
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
