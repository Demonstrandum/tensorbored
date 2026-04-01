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
  DoCheck,
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
  CORNER = 3,
}

const EDGE_ZONE_PX = 8;
const MIN_HEIGHT_PX = 200;
const MIN_WIDTH_PX = 200;
const STORAGE_KEY = '_tb_card_sizes.v1';

interface CardSize {
  height?: number;
  colSpan?: number;
}

function loadSizes(): Record<string, CardSize> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CardSize>) : {};
  } catch {
    return {};
  }
}

function persistSize(key: string, size: CardSize) {
  const sizes = loadSizes();
  const existing = sizes[key] ?? {};
  if (size.height !== undefined) existing.height = Math.round(size.height);
  if (size.colSpan !== undefined) existing.colSpan = size.colSpan;
  sizes[key] = existing;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
}

function clearSize(key: string, field: 'height' | 'colSpan') {
  const sizes = loadSizes();
  const existing = sizes[key];
  if (!existing) return;
  delete existing[field];
  if (!existing.height && !existing.colSpan) {
    delete sizes[key];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
}

function getGridColumnCount(gridEl: HTMLElement): number {
  const cols = getComputedStyle(gridEl).gridTemplateColumns;
  return cols.split(' ').filter((s) => s.length > 0).length;
}

function getGridColumnWidth(gridEl: HTMLElement): number {
  const cols = getComputedStyle(gridEl).gridTemplateColumns;
  const parts = cols.split(' ').filter((s) => s.length > 0);
  if (parts.length === 0) return 0;
  return parseFloat(parts[0]);
}

function getGridGap(gridEl: HTMLElement): number {
  return parseFloat(getComputedStyle(gridEl).columnGap) || 0;
}

/**
 * Adds edge and corner resize handles to a card element in a CSS grid.
 *
 * Bottom edge: drag to resize height (smooth, pixel-based).
 * Right edge:  drag to resize width (smooth pixel-based during drag,
 *              snaps to grid column span on release).
 * Corner:      both.
 * Double-click bottom edge resets height; right edge resets column span.
 */
@Directive({
  standalone: false,
  selector: '[cardEdgeResize]',
})
export class CardEdgeResizeDirective implements OnInit, OnDestroy, DoCheck {
  @Input('cardEdgeResize') persistKey = '';
  @Output() columnSpanChanged = new EventEmitter<number>();

  private readonly el: HTMLElement;
  private activeEdge = ResizeEdge.NONE;
  private startX = 0;
  private startY = 0;
  private startHeight = 0;
  private startWidth = 0;
  private gridColWidth = 0;
  private gridGap = 0;
  private gridTotalCols = 1;
  private dragging = false;

  private readonly onHover: (e: MouseEvent) => void;
  private readonly onDown: (e: MouseEvent) => void;
  private readonly onDocMove: (e: MouseEvent) => void;
  private readonly onDocUp: (e: MouseEvent) => void;
  private readonly onLeave: () => void;
  private readonly onDblClick: (e: MouseEvent) => void;

  constructor(ref: ElementRef<HTMLElement>, private readonly zone: NgZone) {
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
      if (saved?.height) {
        this.el.style.height = `${saved.height}px`;
      }
      if (saved?.colSpan && saved.colSpan > 1) {
        this.snapshotGrid();
        this.applyColSpan(saved.colSpan);
      }
    }
    this.zone.runOutsideAngular(() => {
      this.el.addEventListener('mousemove', this.onHover);
      this.el.addEventListener('mousedown', this.onDown);
      this.el.addEventListener('mouseleave', this.onLeave);
      this.el.addEventListener('dblclick', this.onDblClick);
    });
  }

  ngDoCheck() {
    if (this.dragging) return;
    if (this.el.classList.contains('full-width') && this.el.style.gridColumn) {
      this.el.style.gridColumn = '';
    }
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
    const nearR = r.right - e.clientX <= EDGE_ZONE_PX && e.clientX >= r.left;
    const nearB = r.bottom - e.clientY <= EDGE_ZONE_PX && e.clientY >= r.top;
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

  private applyColSpan(span: number) {
    if (span >= this.gridTotalCols) {
      this.el.style.gridColumn = '1 / -1';
    } else if (span <= 1) {
      this.el.style.gridColumn = '';
    } else {
      this.el.style.gridColumn = `span ${span}`;
    }
  }

  private getCurrentColSpan(): number {
    const gc = this.el.style.gridColumn;
    if (!gc) return 1;
    if (gc.includes('-1')) {
      const grid = this.el.parentElement;
      return grid ? getGridColumnCount(grid) : 1;
    }
    const m = gc.match(/span\s+(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }

  private snapshotGrid() {
    const grid = this.el.parentElement;
    if (!grid) return;
    this.gridTotalCols = getGridColumnCount(grid);
    this.gridColWidth = getGridColumnWidth(grid);
    this.gridGap = getGridGap(grid);
  }

  private spanForWidth(desiredWidth: number): number {
    if (this.gridColWidth <= 0) return 1;
    const cellPlusGap = this.gridColWidth + this.gridGap;
    const raw = (desiredWidth + this.gridGap) / cellPlusGap;
    return Math.max(1, Math.min(this.gridTotalCols, Math.round(raw)));
  }

  private getMaxWidth(): number {
    return (
      this.gridTotalCols * this.gridColWidth +
      (this.gridTotalCols - 1) * this.gridGap
    );
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
    const rect = this.el.getBoundingClientRect();
    this.startHeight = rect.height;
    this.startWidth = rect.width;
    this.snapshotGrid();

    if (edge & ResizeEdge.RIGHT) {
      this.el.style.width = `${this.startWidth}px`;
      this.el.style.gridColumn = '';
      this.el.style.zIndex = '10';
      this.el.style.position = 'relative';
      this.el.style.overflow = 'hidden';
      this.el.classList.add('edge-resizing-width');
    }

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
    if (this.activeEdge & ResizeEdge.RIGHT) {
      const dx = e.clientX - this.startX;
      const w = Math.max(
        MIN_WIDTH_PX,
        Math.min(this.startWidth + dx, this.getMaxWidth())
      );
      this.el.style.width = `${w}px`;
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
      if (this.persistKey) persistSize(this.persistKey, {height: h});
    }

    if (this.activeEdge & ResizeEdge.RIGHT) {
      const currentWidth = this.el.getBoundingClientRect().width;
      const span = this.spanForWidth(currentWidth);

      this.el.style.width = '';
      this.el.style.zIndex = '';
      this.el.style.position = '';
      this.el.style.overflow = '';
      this.el.classList.remove('edge-resizing-width');
      this.applyColSpan(span);

      if (this.persistKey) persistSize(this.persistKey, {colSpan: span});
      this.zone.run(() => this.columnSpanChanged.emit(span));
    }

    this.activeEdge = ResizeEdge.NONE;
  }

  private handleDblClick(e: MouseEvent) {
    const edge = this.edgeAt(e);
    if (edge === ResizeEdge.NONE) return;
    if (edge & ResizeEdge.BOTTOM) {
      this.el.style.height = '';
      if (this.persistKey) clearSize(this.persistKey, 'height');
    }
    if (edge & ResizeEdge.RIGHT) {
      this.snapshotGrid();
      this.applyColSpan(1);
      if (this.persistKey) clearSize(this.persistKey, 'colSpan');
      this.zone.run(() => this.columnSpanChanged.emit(1));
    }
  }
}
