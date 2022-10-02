import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(private model: ModelService) {}

  ngOnInit(): void {
    this.model.register('editClip');
  }

  ngOnDestroy(): void {
    this.model.unregister('editClip');
  }
}
