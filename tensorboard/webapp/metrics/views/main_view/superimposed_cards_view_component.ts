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
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import {CardObserver} from '../card_renderer/card_lazy_loader';
import {SuperimposedCardMetadata} from '../../types';

@Component({
  standalone: false,
  selector: 'superimposed-cards-view-component',
  template: `
    <ng-container *ngIf="superimposedCards.length > 0">
      <div class="group-toolbar">
        <div class="left-items">
          <mat-icon svgIcon="layers_24px"></mat-icon>
          <span class="group-text">
            <span class="group-title" aria-role="heading" aria-level="3"
              >Superimposed</span
            >
            <span *ngIf="superimposedCards.length > 1" class="group-card-count"
              >{{ superimposedCards.length }} cards</span
            >
          </span>
        </div>
      </div>
      <div class="superimposed-cards-grid">
        <div
          *ngFor="let card of superimposedCards; trackBy: trackByCard"
          class="card-wrapper"
        >
          <superimposed-card
            [superimposedCardId]="card.id"
          ></superimposed-card>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ['superimposed_cards_view_component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperimposedCardsViewComponent {
  @Input() cardObserver!: CardObserver;
  @Input() superimposedCards: SuperimposedCardMetadata[] = [];

  trackByCard(index: number, card: SuperimposedCardMetadata): string {
    return card.id;
  }
}
