import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from '../../services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  isDraggedOver: boolean = false;
  file: File | null = null;
  nextStep: boolean = false;
  showAlert: boolean = false;
  alertColor: string = 'blue';
  alertMessage: string = 'Please wait! Your clip is being uploaded.';
  inSubmission: boolean = false;
  percentage: number = 0;
  showPercentage: boolean = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });

  uploadForm = new FormGroup({ title: this.title });
  screenshots: string[] = [];

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile($event: Event) {
    this.isDraggedOver = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    console.log(this.screenshots);
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.showPercentage = true;
    this.alertColor = 'blue';
    this.alertMessage = 'Please wait! Your clip is being uploaded.';
    this.inSubmission = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipReference = this.storage.ref(clipPath);

    this.task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });

    this.task
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipReference.getDownloadURL())
      )
      .subscribe({
        next: async (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocumentReference = await this.clipsService.createClip(
            clip
          );

          this.alertColor = 'green';
          this.alertMessage =
            'Success your clip is now ready to share with the world.';
          this.showPercentage = false;

          setTimeout(() => {
            this.router.navigate(['clip', clipDocumentReference.id]);
          }, 1000);
        },
        error: () => {
          this.uploadForm.enable();
          this.alertColor = 'red';
          this.alertMessage = 'Upload failed! Please try again later';
          this.inSubmission = true;
          this.showPercentage = false;
        },
      });
  }
}
