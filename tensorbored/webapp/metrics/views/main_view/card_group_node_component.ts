/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

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
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {State} from '../../../app_state';
import {getMetricsTagGroupExpansionState} from '../../../selectors';
import {CardGroupNode} from '../metrics_view_types';
import {CardObserver} from '../card_renderer/card_lazy_loader';

@Component({
  standalone: false,
  selector: 'metrics-card-group-node',
  template: `
    <div class="card-group-node">
      <metrics-card-group-toolbar
        [numberOfCards]="node.totalCards"
        [groupName]="node.groupPath"
        [displayName]="node.segmentName"
        [depth]="depth"
      ></metrics-card-group-toolbar>
      <div *ngIf="isExpanded$ | async" class="node-content">
        <metrics-card-grid
          *ngIf="node.items.length > 0"
          [cardIdsWithMetadata]="node.items"
          [cardObserver]="cardObserver"
          [groupName]="null"
        ></metrics-card-grid>
        <metrics-card-group-node
          *ngFor="let child of node.children; trackBy: trackByNode"
          [node]="child"
          [depth]="depth + 1"
          [cardObserver]="cardObserver"
        ></metrics-card-group-node>
      </div>
    </div>
  `,
  styleUrls: ['card_group_node_component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardGroupNodeComponent implements OnChanges {
  @Input() node!: CardGroupNode;
  @Input() depth: number = 0;
  @Input() cardObserver!: CardObserver;

  private readonly groupPath$ = new BehaviorSubject<string>('');
  readonly isExpanded$: Observable<boolean>;

  constructor(private readonly store: Store<State>) {
    this.isExpanded$ = this.groupPath$.pipe(
      switchMap((groupPath) =>
        this.store.select(getMetricsTagGroupExpansionState, groupPath)
      )
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['node']) {
      this.groupPath$.next(this.node.groupPath);
    }
  }

  trackByNode(_index: number, node: CardGroupNode) {
    return node.groupPath;
  }
}
