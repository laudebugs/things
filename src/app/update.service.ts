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
  tap,
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
      tap(() => console.log('App is stable')),
      mergeMap(() => update$),
      tap((result) => console.log('Update Available: ' + result)),
      mergeMap(() => versionUpdates$),
      tap((version) => console.log('Current version is: ' + version.currentVersion.hash)),
      retry(1)
    );

    appIsStable$
      .pipe(mergeMap(() => appUpdates$))
      .subscribe((value) => this.updateApplication(value));
  }

  updateApplication(appUpdate: VersionReadyEvent) {
    console.log('Update Available: ' + appUpdate.currentVersion.hash + ' -> ' + appUpdate.latestVersion.hash);
    const snack = this.snackbar.open('Update Available', 'Reload');

    snack.afterDismissed().subscribe(() => window.location.reload());
  }
}
