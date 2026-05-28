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
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CardObserver} from '../card_renderer/card_lazy_loader';
import {CardGroupNode} from '../metrics_view_types';

@Component({
  standalone: false,
  selector: 'metrics-card-groups-component',
  template: `
    <metrics-card-group-node
      *ngFor="let node of cardGroupNodes; trackBy: trackByNode"
      [node]="node"
      [depth]="0"
      [cardObserver]="cardObserver"
    ></metrics-card-group-node>
  `,
  styleUrls: [`card_groups_component.css`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardGroupsComponent {
  @Input() cardGroupNodes!: CardGroupNode[];
  @Input() cardObserver!: CardObserver;

  trackByNode(_index: number, node: CardGroupNode) {
    return node.groupPath;
  }
}
