import {ErrorHandler, Injectable, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from '@src/app/root/app-routing.module';
import {AppComponent} from '@src/app/root/components/app/app.component';
import {HttpClientModule} from '@angular/common/http';
import {SharedModule} from '@src/app/shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AuthenticationModule} from '@src/app/authentication/authentication.module';
import {componentDeclarations} from '@src/app/root/app.common';
import {MatRippleModule, MatSnackBarModule, MatToolbarModule} from '@angular/material';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ClipboardModule} from 'ngx-clipboard';
import * as Sentry from '@sentry/browser';

Sentry.init({
    dsn: 'https://124756e227874bbabe6cd62e1c14b9f6@sentry.io/3459782'
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
    constructor() {}
    handleError(error) {
        const eventId = Sentry.captureException(error.originalError || error);
        Sentry.showReportDialog({ eventId });
    }
}

export const imports = [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    FontAwesomeModule,
    MatRippleModule,
    MatSnackBarModule,
    ClipboardModule,

    // Custom modules
    SharedModule,
    AuthenticationModule,

    // Must be specified at the end.
    AppRoutingModule,
];

/**
 * Root module of the application - web version.
 */
@NgModule({
    declarations: [
        componentDeclarations
    ],
    imports: [
        imports
    ],
    providers: [
        {provide: ErrorHandler, useClass: SentryErrorHandler}
    ],
    bootstrap: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {
}
