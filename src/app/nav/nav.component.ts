import { Component, OnInit } from '@angular/core';
import { ModelService } from '../services/model.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  constructor(public model: ModelService) {}

  ngOnInit(): void {}

  openModel($event: Event) {
    $event.preventDefault();
    this.model.toggleModel('auth');
  }
}
