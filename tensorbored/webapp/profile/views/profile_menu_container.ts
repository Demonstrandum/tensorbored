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
import {Component, ChangeDetectionStrategy} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import {State} from '../../app_state';
import {ProfileMetadata} from '../types';
import * as profileSelectors from '../store/profile_selectors';
import * as profileActions from '../actions/profile_actions';

@Component({
  selector: 'tb-profile-menu',
  template: `
    <tb-profile-menu-component
      [profiles]="profiles$ | async"
      [activeProfileName]="activeProfileName$ | async"
      [hasUnsavedChanges]="hasUnsavedChanges$ | async"
      (save)="onSave($event)"
      (saveAs)="onSaveAs()"
      (load)="onLoad($event)"
      (delete)="onDelete($event)"
      (export)="onExport()"
      (import)="onImport()"
      (deactivate)="onDeactivate()"
      (clearAll)="onClearAll()"
    ></tb-profile-menu-component>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuContainer {
  readonly profiles$: Observable<ProfileMetadata[]>;
  readonly activeProfileName$: Observable<string | null>;
  readonly hasUnsavedChanges$: Observable<boolean>;

  constructor(private readonly store: Store<State>) {
    this.profiles$ = this.store.select(profileSelectors.getAvailableProfiles);
    this.activeProfileName$ = this.store.select(
      profileSelectors.getActiveProfileName
    );
    this.hasUnsavedChanges$ = this.store.select(
      profileSelectors.getHasUnsavedChanges
    );
  }

  onSave(name: string): void {
    this.store.dispatch(profileActions.profileSaveRequested({name}));
  }

  onSaveAs(): void {
    const name = prompt('Enter profile name:', 'My Profile');
    if (name && name.trim()) {
      this.store.dispatch(
        profileActions.profileSaveRequested({name: name.trim()})
      );
    }
  }

  onLoad(name: string): void {
    this.store.dispatch(profileActions.profileLoadRequested({name}));
  }

  onDelete(name: string): void {
    if (confirm(`Are you sure you want to delete profile "${name}"?`)) {
      this.store.dispatch(profileActions.profileDeleteRequested({name}));
    }
  }

  onExport(): void {
    this.activeProfileName$.pipe(take(1)).subscribe((activeProfileName) => {
      if (!activeProfileName) {
        alert('No active profile to export. Save or load a profile first.');
        return;
      }
      this.store.dispatch(
        profileActions.profileExportRequested({name: activeProfileName})
      );
    });
  }

  onImport(): void {
    // Create a file input and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const json = e.target?.result as string;
          if (json) {
            this.store.dispatch(profileActions.profileImportRequested({json}));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  onDeactivate(): void {
    this.store.dispatch(profileActions.profileDeactivated());
  }

  onClearAll(): void {
    if (
      confirm(
        'Are you sure you want to delete ALL profiles? This cannot be undone.'
      )
    ) {
      this.store.dispatch(profileActions.profilesClearAllRequested());
    }
  }
}
