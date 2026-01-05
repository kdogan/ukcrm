import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileViewerComponent } from './shared/components/file-viewer/file-viewer.component';
import { LanguageService } from './services/language.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, FileViewerComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true
})
export class AppComponent implements OnInit {
  title = 'berater-ui';

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    // Sprache beim App-Start initialisieren
    this.languageService.initializeLanguage();
  }
}
