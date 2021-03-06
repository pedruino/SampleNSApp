import {Routes} from '@angular/router';
import {HttpErrorComponent} from '@src/app/shared/components/http/http-error/http-error.component';
import {HttpWaitingComponent} from '@src/app/shared/components/http/http-waiting/http-waiting.component';
import {NotFoundComponent} from '@src/app/shared/components/http/not-found/not-found.component';
import {TitleNavBarComponent} from '@src/app/shared/components/navigation/title-nav-bar/title-nav-bar.component';
import {SideDrawerBarComponent} from '@src/app/shared/components/navigation/side-drawer-bar/side-drawer-bar.component';
import {SentryTestComponent} from '@src/app/shared/components/sentry/sentry-test/sentry-test.component';

/**
 * Shared components.
 */
export const componentDeclarations: any[] = [
    SentryTestComponent,
    HttpErrorComponent,
    HttpWaitingComponent,
    NotFoundComponent,
    TitleNavBarComponent,
    SideDrawerBarComponent,
];

/**
 * Shared providers.
 */
export const providerDeclarations: any[] = [
];

/**
 * Shared routes.
 */
export const routes: Routes = [
];
