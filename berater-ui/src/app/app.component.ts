import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileViewerComponent } from './shared/components/file-viewer/file-viewer.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, FileViewerComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone:true
})
export class AppComponent {
  title = 'berater-ui';
}
