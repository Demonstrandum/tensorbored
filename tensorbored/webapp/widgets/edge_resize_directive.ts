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
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

const enum ResizeEdge {
  NONE = 0,
  RIGHT = 1,
  BOTTOM = 2,
  CORNER = 3, // RIGHT | BOTTOM
}

const EDGE_ZONE_PX = 8;
const MIN_HEIGHT_PX = 200;
const FULL_WIDTH_DRAG_THRESHOLD_PX = 50;
const STORAGE_KEY = '_tb_card_sizes.v1';

function loadSizes(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function persistHeight(key: string, height: number) {
  const sizes = loadSizes();
  sizes[key] = Math.round(height);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
}

function removeHeight(key: string) {
  const sizes = loadSizes();
  delete sizes[key];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
}

/**
 * Adds edge and corner resize handles to a card wrapper element.
 *
 * Bottom edge:  drag to resize height.
 * Right edge:   drag > threshold emits fullWidthRequested.
 * Corner:       both.
 * Double-click on bottom edge resets height; on right edge toggles full-width.
 *
 * Usage:  <div [cardEdgeResize]="uniqueKey"
 *              (fullWidthRequested)="onFullWidth($event)">
 */
@Directive({
  standalone: false,
  selector: '[cardEdgeResize]',
})
export class CardEdgeResizeDirective implements OnInit, OnDestroy {
  @Input('cardEdgeResize') persistKey = '';
  @Output() fullWidthRequested = new EventEmitter<boolean>();

  private readonly el: HTMLElement;
  private activeEdge = ResizeEdge.NONE;
  private startX = 0;
  private startY = 0;
  private startHeight = 0;
  private dragging = false;

  private readonly onHover: (e: MouseEvent) => void;
  private readonly onDown: (e: MouseEvent) => void;
  private readonly onDocMove: (e: MouseEvent) => void;
  private readonly onDocUp: (e: MouseEvent) => void;
  private readonly onLeave: () => void;
  private readonly onDblClick: (e: MouseEvent) => void;

  constructor(
    ref: ElementRef<HTMLElement>,
    private readonly zone: NgZone
  ) {
    this.el = ref.nativeElement;
    this.onHover = this.handleHover.bind(this);
    this.onDown = this.handleDown.bind(this);
    this.onDocMove = this.handleDocMove.bind(this);
    this.onDocUp = this.handleDocUp.bind(this);
    this.onLeave = this.handleLeave.bind(this);
    this.onDblClick = this.handleDblClick.bind(this);
  }

  ngOnInit() {
    if (this.persistKey) {
      const saved = loadSizes()[this.persistKey];
      if (saved) {
        this.el.style.height = `${saved}px`;
      }
    }
    this.zone.runOutsideAngular(() => {
      this.el.addEventListener('mousemove', this.onHover);
      this.el.addEventListener('mousedown', this.onDown);
      this.el.addEventListener('mouseleave', this.onLeave);
      this.el.addEventListener('dblclick', this.onDblClick);
    });
  }

  ngOnDestroy() {
    this.el.removeEventListener('mousemove', this.onHover);
    this.el.removeEventListener('mousedown', this.onDown);
    this.el.removeEventListener('mouseleave', this.onLeave);
    this.el.removeEventListener('dblclick', this.onDblClick);
    document.removeEventListener('mousemove', this.onDocMove);
    document.removeEventListener('mouseup', this.onDocUp);
  }

  private edgeAt(e: MouseEvent): ResizeEdge {
    const r = this.el.getBoundingClientRect();
    const nearR =
      r.right - e.clientX <= EDGE_ZONE_PX && e.clientX >= r.left;
    const nearB =
      r.bottom - e.clientY <= EDGE_ZONE_PX && e.clientY >= r.top;
    if (nearR && nearB) return ResizeEdge.CORNER;
    if (nearB) return ResizeEdge.BOTTOM;
    if (nearR) return ResizeEdge.RIGHT;
    return ResizeEdge.NONE;
  }

  private cursorFor(edge: ResizeEdge): string {
    if (edge === ResizeEdge.CORNER) return 'nwse-resize';
    if (edge === ResizeEdge.BOTTOM) return 'ns-resize';
    if (edge === ResizeEdge.RIGHT) return 'ew-resize';
    return '';
  }

  private edgeName(edge: ResizeEdge): string {
    if (edge === ResizeEdge.CORNER) return 'corner';
    if (edge === ResizeEdge.BOTTOM) return 'bottom';
    if (edge === ResizeEdge.RIGHT) return 'right';
    return '';
  }

  private handleHover(e: MouseEvent) {
    if (this.dragging) return;
    const edge = this.edgeAt(e);
    this.el.style.cursor = this.cursorFor(edge);
    this.el.setAttribute('data-resize-edge', this.edgeName(edge));
  }

  private handleLeave() {
    if (this.dragging) return;
    this.el.style.cursor = '';
    this.el.setAttribute('data-resize-edge', '');
  }

  private handleDown(e: MouseEvent) {
    const edge = this.edgeAt(e);
    if (edge === ResizeEdge.NONE) return;
    e.preventDefault();
    e.stopPropagation();
    this.dragging = true;
    this.activeEdge = edge;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startHeight = this.el.getBoundingClientRect().height;
    document.body.style.cursor = this.cursorFor(edge);
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', this.onDocMove);
    document.addEventListener('mouseup', this.onDocUp);
  }

  private handleDocMove(e: MouseEvent) {
    if (!this.dragging) return;
    if (this.activeEdge & ResizeEdge.BOTTOM) {
      const h = Math.max(
        MIN_HEIGHT_PX,
        this.startHeight + e.clientY - this.startY
      );
      this.el.style.height = `${h}px`;
    }
  }

  private handleDocUp(e: MouseEvent) {
    if (!this.dragging) return;
    this.dragging = false;
    document.removeEventListener('mousemove', this.onDocMove);
    document.removeEventListener('mouseup', this.onDocUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    this.el.style.cursor = '';
    this.el.setAttribute('data-resize-edge', '');

    if (this.activeEdge & ResizeEdge.BOTTOM) {
      const h = Math.max(
        MIN_HEIGHT_PX,
        this.startHeight + e.clientY - this.startY
      );
      this.el.style.height = `${h}px`;
      if (this.persistKey) persistHeight(this.persistKey, h);
    }

    if (this.activeEdge & ResizeEdge.RIGHT) {
      const dx = e.clientX - this.startX;
      if (dx > FULL_WIDTH_DRAG_THRESHOLD_PX) {
        this.zone.run(() => this.fullWidthRequested.emit(true));
      } else if (dx < -FULL_WIDTH_DRAG_THRESHOLD_PX) {
        this.zone.run(() => this.fullWidthRequested.emit(false));
      }
    }

    this.activeEdge = ResizeEdge.NONE;
  }

  private handleDblClick(e: MouseEvent) {
    const edge = this.edgeAt(e);
    if (edge === ResizeEdge.NONE) return;
    if (edge & ResizeEdge.BOTTOM) {
      this.el.style.height = '';
      if (this.persistKey) removeHeight(this.persistKey);
    }
    if (edge & ResizeEdge.RIGHT) {
      this.zone.run(() =>
        this.fullWidthRequested.emit(
          !this.el.classList.contains('full-width')
        )
      );
    }
  }
}
