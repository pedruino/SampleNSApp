import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '@arhs/core';
import {GestureEventData, isAndroid, Page} from '@nativescript/core';
import * as statusBar from 'nativescript-status-bar';
import {ApplicationEventData, on} from 'tns-core-modules/application';
import {RouterExtensions} from '@nativescript/angular';
import {IMobileAnimationService, MobileAnimationService, TapAnimation} from '@arhs/ui';
import {RadSideDrawerComponent} from 'nativescript-ui-sidedrawer/angular';
import {environment} from '@src/environments/environment';
import {AuthenticationService} from '@src/app/authentication/services/implementations/authentication.service';
import {AppCommon} from '@src/app/root/components/app/app.common';
import {SessionService} from '@src/app/shared/services/implementations/sessionService/session.service.tns';
import {Message} from 'nativescript-plugin-firebase';
import {IFeedbackService} from '@src/app/feedback/services/IFeedbackService';
import {FeedbackService} from '@src/app/feedback/services/implementations/feedback.service';

/**
 * Firebase plugin.
 */
const firebase = require('nativescript-plugin-firebase');

/**
 * Root component. Entrance of the App.
 *
 * Extends {@link AppCommon}.
 */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.tns.html',
    styleUrls: [
        './app.component.css',
    ]
})
export class AppComponent extends AppCommon implements OnInit {

    /**
     * Side drawer menu.
     */
    @ViewChild('sideDrawer', {static: true}) sideDrawer: RadSideDrawerComponent;
    /**
     * @ignore
     */
    private animationService: IMobileAnimationService;

    /**
     * @ignore
     */
    private feedbackService: IFeedbackService;

    /**
     * Constructor.
     * @param page Related page of the component.
     * @param httpService Service used to Http CRUD operations.
     * @param routerExtensions Nativescript router.
     * @param sessionService Service related to user authentication.
     * @param animationSrv Manage all the animations.
     * @param authenticationService Service used for sessions and data persistence.
     */
    constructor(page: Page,
                private httpService: HttpService,
                private routerExtensions: RouterExtensions,
                sessionService: SessionService,
                animationSrv: MobileAnimationService,
                authenticationService: AuthenticationService,
                feedbackService: FeedbackService) {
        super(authenticationService, sessionService);
        this.animationService = animationSrv;
        this.feedbackService = feedbackService;

        // httpService.rootUrl = 'http://10.66.0.21:9700/';
        httpService.rootUrl = 'http://10.0.2.2:9700/';

        AppComponent.hideAndroidStatusBar();
        on('resume', (args: ApplicationEventData) => {
            if (args.android) {
                AppComponent.hideAndroidStatusBar();
            }
        }, this);
    }

    /**
     * Hide android status Bar.
     */
    private static hideAndroidStatusBar(): void {
        if (isAndroid) {
            statusBar.hide();
        }
    }

    /**
     * Refers to {@link OnInit}.
     */
    ngOnInit(): void {
        super.ngOnInit();
        (<SessionService>this.sessionService).sideDrawer = this.sideDrawer;
        this.initFirebase();
    }

    /**
     * Refers to {@link AppCommon}
     */
    public logout(): void {
        this.authenticationService.signOut();
        this.routerExtensions.navigate([''], {clearHistory: true, transition: environment.defaultRoutingTransition});
        this.sideDrawer.sideDrawer.closeDrawer();
    }

    /**
     * Navigate to home page.
     */
    public navToHome(): void {
        this.routerExtensions.navigate(['home'], {clearHistory: true, transition: environment.defaultRoutingTransition});
        this.sideDrawer.sideDrawer.closeDrawer();
    }

    /**
     * Navigate to subscription page.
     */
    public navToSubscriptions(): void {
        this.routerExtensions.navigate(['subscription'], {clearHistory: true, transition: environment.defaultRoutingTransition});
        this.sideDrawer.sideDrawer.closeDrawer();
    }

    /**
     * Navigate to the login page.
     */
    public navToLogin(): void {
        this.routerExtensions.navigate(['login'], {clearHistory: true, transition: environment.defaultRoutingTransition});
        this.sideDrawer.sideDrawer.closeDrawer();
    }

    /**
     * Navigate to the notification page.
     */
    public navToNotifications(): void {
        this.routerExtensions.navigate(['notification'], {clearHistory: true, transition: environment.defaultRoutingTransition});
        this.sideDrawer.sideDrawer.closeDrawer();
    }

    /**
     * Animate the page buttons.
     * @param event
     */
    public animateButtons(event: GestureEventData): void {
        this.animationService.animate<TapAnimation>(event.view, TapAnimation);
    }

    /**
     * Refers to {@link AppCommon}
     */
    protected redirectToHomePage(): void {
        this.navToHome();
    }

    /**
     * Refers to {@link AppCommon}
     */
    protected redirectToLoginPage(): void {
        this.navToLogin();
    }

    /**
     * Init the firebase plugin.
     */
    private initFirebase(): void {
        firebase.init({
            onMessageReceivedCallback: (message: Message) => {
                if (message.foreground) {
                    this.feedbackService.notifyInfo('PUSH Notification: ' + message.title, message.body);
                }
                console.log(`Title: ${message.title}`);
                console.log(`Body: ${message.body}`);
            },
            onPushTokenReceivedCallback: function (token) {
                console.log('Firebase push token: ' + token);
            },
            showNotificationsWhenInForeground: false,
        }).then(() => {
            console.error('Firebase.init ok.');
        }, reason => {
            console.error('Firebase.init fail: ' + reason);
        });
    }
}
