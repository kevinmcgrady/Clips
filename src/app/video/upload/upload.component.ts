import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from '../../services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';
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
  screenshotTask?: AngularFireUploadTask;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });

  uploadForm = new FormGroup({ title: this.title });
  screenshots: string[] = [];
  selectedScreenshot: string = '';

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
    if (this.ffmpegService.isRunning) {
      return;
    }

    this.isDraggedOver = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  async uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.showPercentage = true;
    this.alertColor = 'blue';
    this.alertMessage = 'Please wait! Your clip is being uploaded.';
    this.inSubmission = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromUrl(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipReference = this.storage.ref(clipPath);
    const screenshotReference = this.storage.ref(screenshotPath);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;

      if (!clipProgress || !screenshotProgress) {
        return;
      }

      const total = clipProgress + screenshotProgress;
      this.percentage = (total as number) / 200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([
            clipReference.getDownloadURL(),
            screenshotReference.getDownloadURL(),
          ])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipUrl, screenshotUrl] = urls;

          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: clipUrl,
            screenshotUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            screenshotFileName: `${clipFileName}.png`,
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
