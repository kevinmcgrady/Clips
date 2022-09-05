import { Component, Input } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css'],
})
export class ModelComponent {
  @Input() modelID = '';

  constructor(public model: ModelService) {}

  closeModel() {
    this.model.toggleModel(this.modelID);
  }
}
