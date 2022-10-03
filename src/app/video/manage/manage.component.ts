import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModelService } from 'src/app/services/model.service';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;
  isLinkCoppied: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private model: ModelService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1';
      this.sort$.next(this.videoOrder);
    });

    this.clipService.getUserClips(this.sort$).subscribe((docs) => {
      this.clips = [];
      docs.forEach((doc) => this.clips.push({ ...doc.data(), docId: doc.id }));
    });
  }

  sort(event: Event) {
    const { value } = event.target as HTMLSelectElement;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }

  openModel($event: Event, clip: IClip) {
    $event.preventDefault();
    this.activeClip = clip;
    this.model.toggleModel('editClip');
  }

  update($event: IClip) {
    this.clips.forEach((clip, index) => {
      if (clip.docId == $event.docId) {
        this.clips[index].title = $event.title;
      }
    });
  }

  deleteClip($event: Event, clip: IClip) {
    $event.preventDefault();
    this.clipService.deleteClip(clip);
    this.clips.forEach((element, index) => {
      if (element.docId == clip.docId) {
        this.clips.splice(index, 1);
      }
    });
  }

  async copyToClipboard($event: MouseEvent, docId: string | undefined) {
    $event.preventDefault();

    if (!docId) {
      return;
    }

    const url = `${location.origin}/clip/${docId}`;
    await navigator.clipboard.writeText(url);

    this.isLinkCoppied = true;

    setTimeout(() => {
      this.isLinkCoppied = false;
    }, 2000);
  }
}
