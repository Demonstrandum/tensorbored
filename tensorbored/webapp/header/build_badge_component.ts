/* Copyright 2024 The TensorFlow Authors. All Rights Reserved.

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
import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, of} from 'rxjs';

interface BuildInfo {
  commit?: string;
  wheel?: string;
  timestamp?: string;
}

@Component({
  standalone: false,
  selector: 'build-badge',
  template: `
    <a
      *ngIf="commitSha"
      class="build-badge"
      [href]="commitUrl"
      target="_blank"
      rel="noopener noreferrer"
      [title]="'Build: ' + commitSha"
    >
      {{ commitSha }}
    </a>
  `,
  styles: [
    `
      .build-badge {
        font-family: monospace;
        font-size: 11px;
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: inherit;
        text-decoration: none;
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      .build-badge:hover {
        opacity: 1;
        text-decoration: underline;
      }
    `,
  ],
})
export class BuildBadgeComponent implements OnInit {
  commitSha: string | null = null;
  commitUrl: string = '';

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.http
      .get<BuildInfo>('data/build_info')
      .pipe(catchError(() => of(null)))
      .subscribe((info) => {
        if (info?.commit) {
          this.commitSha = info.commit;
          this.commitUrl = `https://github.com/Demonstrandum/tensorbored/commit/${info.commit}`;
        }
      });
  }
}
