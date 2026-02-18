import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@features/auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div
      class="app-root"
      [class.app-light-theme]="!themeService.isDark()"
      [class.app-dark-theme]="themeService.isDark()"
    >
      <router-outlet />
    </div>
  `,
  styles: [
    `
      .app-root {
        min-height: 100vh;
        transition: background-color 0.2s ease, color 0.2s ease;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.loadUser();
  }
}
