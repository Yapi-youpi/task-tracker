import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly snackBar = inject(MatSnackBar);

  showError(message: string, action = 'OK'): void {
    this.snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['error-snack'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  showSuccess(message: string, action = 'OK'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: ['success-snack'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
