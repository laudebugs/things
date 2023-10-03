import { ApplicationRef, Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import {
  EMPTY,
  catchError,
  concat,
  filter,
  first,
  from,
  mergeMap,
  retry,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  constructor(
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private snackbar: MatSnackBar
  ) {
    this.checkForUpdates();
  }

  checkForUpdates() {
    const appIsStable$ = this.appRef.isStable.pipe(
      first((isStable) => isStable === true)
    );

    const update$ = from(
      this.updates.checkForUpdate().catch(() => Promise.resolve(false))
    );

    const versionUpdates$ = this.updates.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      catchError(() => EMPTY)
    );

    const appUpdates$ = appIsStable$.pipe(
      mergeMap(() => update$),
      mergeMap(() => versionUpdates$),
      retry(1)
    );

    appIsStable$
      .pipe(mergeMap(() => appUpdates$))
      .subscribe((value) => this.updateApplication(value));
  }

  updateApplication(appUpdate: VersionReadyEvent) {
    const snack = this.snackbar.open('Update Available', 'Reload');

    snack.afterDismissed().subscribe(() => window.location.reload());
  }
}
