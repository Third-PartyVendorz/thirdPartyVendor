import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-slider.html',
  styleUrl: './custom-slider.scss'
})
export class CustomSliderComponent<T = any> {
  @Input({ required: true }) leftLabel!: string;
  @Input({ required: true }) rightLabel!: string;

  @Input({ required: true }) leftValue!: T;
  @Input({ required: true }) rightValue!: T;

  @Input() leftColor: string = '#10b981'; // Default: Green
  @Input() rightColor: string = '#ef4444'; // Default: Red

  @Input() fullWidth: boolean = false;

  @Input({ required: true }) value!: T;
  @Output() valueChange = new EventEmitter<T>();

  get currentColor(): string {
    return this.value === this.rightValue ? this.rightColor : this.leftColor;
  }

  toggle(): void {
    const newValue = this.value === this.leftValue ? this.rightValue : this.leftValue;
    this.valueChange.emit(newValue);
  }
}