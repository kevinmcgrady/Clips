import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import IClip from 'src/app/models/clip.model';
import { ModelService } from 'src/app/services/model.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();

  inSubmission: boolean = false;
  showAlert: boolean = false;
  alertColor: string = 'blue';
  alertMessage: string = 'Please wait! Updating clip.';
  clipId = new FormControl('', { nonNullable: true });
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  editForm = new FormGroup({ title: this.title, id: this.clipId });

  constructor(private model: ModelService, private clipService: ClipService) {}

  async submit() {
    if (!this.activeClip) {
      return;
    }

    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMessage = 'Please wait! Updating clip.';

    try {
      await this.clipService.updateClip(this.clipId.value, this.title.value);
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMessage = 'Something went wrong. Try again later.';
      return;
    }
    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);
    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMessage = 'Success! Your clip has been updated.';
  }

  ngOnInit(): void {
    this.model.register('editClip');
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return;
    }
    this.clipId.setValue(this.activeClip.docId as string);
    this.title.setValue(this.activeClip.title);
  }

  ngOnDestroy(): void {
    this.model.unregister('editClip');
  }
}
