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
import {ProfileMetadata, ProfileData, createEmptyProfile} from '../types';
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
      (viewJson)="onViewJson()"
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
  readonly activeProfile$: Observable<ProfileData | null>;
  readonly hasUnsavedChanges$: Observable<boolean>;

  constructor(private readonly store: Store<State>) {
    this.profiles$ = this.store.select(profileSelectors.getAvailableProfiles);
    this.activeProfileName$ = this.store.select(
      profileSelectors.getActiveProfileName
    );
    this.activeProfile$ = this.store.select(profileSelectors.getActiveProfile);
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

  onViewJson(): void {
    this.activeProfile$.pipe(take(1)).subscribe((profile) => {
      const profileToShow = profile ?? createEmptyProfile('Default');
      const json = JSON.stringify(profileToShow, null, 2);
      const profileName = profile
        ? profile.name
        : 'Default (no profile active)';
      const isDarkMode = document.body.classList.contains('dark-mode');

      // Create a simple modal to show the JSON
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      const content = document.createElement('div');
      content.style.cssText = `
        background: ${isDarkMode ? '#303030' : 'white'};
        color: ${isDarkMode ? '#e0e0e0' : '#333'};
        border-radius: 8px;
        padding: 16px;
        max-width: 80vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      `;
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid ${isDarkMode ? '#555' : '#eee'};
      `;
      header.innerHTML = `
        <strong style="font-size: 16px;">Profile: ${profileName}</strong>
        <button id="close-modal" style="
          border: none;
          background: ${isDarkMode ? '#424242' : '#f5f5f5'};
          color: ${isDarkMode ? '#e0e0e0' : '#333'};
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Close</button>
      `;
      const pre = document.createElement('pre');
      pre.style.cssText = `
        overflow: auto;
        flex: 1;
        margin: 0;
        padding: 12px;
        background: ${isDarkMode ? '#1e1e1e' : '#f5f5f5'};
        color: ${isDarkMode ? '#d4d4d4' : '#333'};
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
      `;
      pre.textContent = json;
      content.appendChild(header);
      content.appendChild(pre);
      modal.appendChild(content);
      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('#close-modal');
      const closeModal = () => document.body.removeChild(modal);
      closeBtn?.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    });
  }

  onExport(): void {
    this.activeProfile$.pipe(take(1)).subscribe((profile) => {
      const profileToExport = profile ?? createEmptyProfile('Default');
      const json = JSON.stringify(profileToExport, null, 2);
      const fileName = `${profileToExport.name.replace(
        /[^a-z0-9]/gi,
        '_'
      )}.json`;

      // Create and trigger download
      const blob = new Blob([json], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
