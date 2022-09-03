import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelComponent } from './model/model.component';

@NgModule({
  declarations: [ModelComponent],
  imports: [CommonModule],
  exports: [ModelComponent],
})
export class SharedModule {}
