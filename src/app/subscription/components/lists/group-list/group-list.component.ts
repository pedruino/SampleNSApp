import {Component, EventEmitter, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {LoggerService} from '@src/app/shared/services/implementations/logger.service';
import {ILoggerService} from '@src/app/shared/services/ILoggerService';
import {HttpErrorResponse} from '@angular/common/http';
import {ITableColumn, ITableFactory, ITableOptions, TableFactoryService} from '@arhs/ui';
import {
    CollectionModel,
    Group,
    GroupService,
    HttpError,
    HttpErrorService,
    IGroupService,
    IHttpErrorService,
    ISubscriptionService,
    Subscription,
    SubscriptionService
} from '@arhs/core';
import {IAuthenticationService} from '@src/app/authentication/services/IAuthenticationService';
import {AuthenticationService} from '@src/app/authentication/services/implementations/authentication.service';
import {RefreshableListComponent} from '@src/app/shared/models/RefreshableListComponent';
import {isNumber} from 'util';

@Component({
    selector: 'app-groups-list',
    templateUrl: './group-list.component.html',
    styleUrls: ['./group-list.component.css']
})
export class GroupListComponent extends RefreshableListComponent<Group, number> implements OnInit, OnDestroy {

    @Input() elementDetails: TemplateRef<any>;
    @Input() onlyIfSubscribed = undefined;

    // Services
    private groupService: IGroupService;
    private subscriptionService: ISubscriptionService;
    private errorService: IHttpErrorService;
    private loggerService: ILoggerService;
    private tableFactory: ITableFactory;
    private authenticationService: IAuthenticationService;

    groups: Group[] = undefined;
    userSubscriptions: Subscription[] = [];
    error: HttpError;

    /**
     * Required vars for library table test.
     */
    refreshEvent: EventEmitter<Group[]> = new EventEmitter<[]>();
    tableOptions: ITableOptions<Group> = null;
    tableColumns: ITableColumn[] = null;
    selectedItems: Group[] = [];

    constructor(groupService: GroupService,
                loggerService: LoggerService,
                errorService: HttpErrorService,
                subscriptionService: SubscriptionService,
                tableFactory: TableFactoryService,
                authenticationService: AuthenticationService) {
        super();
        this.groupService = groupService;
        this.loggerService = loggerService;
        this.errorService = errorService;
        this.subscriptionService = subscriptionService;
        this.tableFactory = tableFactory;
        this.authenticationService = authenticationService;
        this.initList();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getGroups();
    }

    public getGroups() {
        this.groups = undefined;
        this.error = null;
        this.loggerService.debug(this, 'Retrieving groups.');

        this.groupService.getAllGroups().subscribe((value: CollectionModel<Group>) => {
            if (value._embedded) {
                this.groups = value._embedded.items;
            } else {
                this.groups = [];
            }
            this.getUserSubscriptions();
        }, (error: HttpErrorResponse) => {
            const formattedError = this.errorService.handleError(error);
            this.loggerService.error(this, 'Error during retrieving groups from API. Error: ' + formattedError);
            this.error = formattedError;
        });
    }

    public getUserSubscriptions(): void {
        this.error = null;
        this.userSubscriptions = [];
        this.loggerService.debug(this, 'Retrieving user subscriptions.');

        this.subscriptionService.getSubscriptionsByUserId(this.authenticationService.getAuthenticatedUserId()).subscribe(value => {
            if (value._embedded) {
                this.userSubscriptions = value._embedded.items;
            } else {
                this.userSubscriptions = [];
            }
            this.refreshList(this.groups);
        }, error => {
            const formattedError = this.errorService.handleError(error);
            this.loggerService.error(this, 'Error during retrieving user subscriptions from API. Error: ' + formattedError);
            this.error = formattedError;
        });
    }

    // TODO
    public onSelectedItem(items: Group[]): void {
        if (items) {
            this.selectedItems = items;
        }
    }

    private initList(): void {
        this.tableOptions = this.tableFactory.getOptions<Group>(false, true, false, true, [10, 1, 5, 25], true, true, true);
        this.tableColumns = this.tableFactory.getColumns([
            '#ID', 'Name', 'Description'
        ], [
            'id', 'name', 'description'
        ]);
    }

    protected refreshList(newElement?: Group[]): void {
        if (newElement) {
            this.formatData();
            this.refreshEvent.emit(newElement);
        } else {
            this.getGroups();
        }
    }

    private formatData(): void {
        if (this.onlyIfSubscribed !== undefined) {
            const groups: Group[] = [];
            const subscriptionIds: number[] = [];

            this.userSubscriptions.forEach(value => {
                subscriptionIds.push(value.groupId);
            });

            if (this.onlyIfSubscribed) {
                this.groups.forEach(value => {
                    if (subscriptionIds.includes(value.id)) {
                        groups.push(value);
                    }
                });
            } else if (!this.onlyIfSubscribed) {
                this.groups.forEach(value => {
                    if (!subscriptionIds.includes(value.id)) {
                        groups.push(value);
                    }
                });
            }

            this.groups = groups;
        }
    }

    protected removeElement(group: Group | number): void {
        if (this.groups) {
            this.groups.splice(this.findIndex(isNumber(group) ? group : this.convertToId(group)), 1);
            this.refreshList(this.groups);
        }
    }

    protected addElement(group: Group | number): void {
        if (this.groups) {
            this.groups.push((isNumber(group) ? this.convertToElement(group) : group));
            this.refreshList(this.groups);
        }
    }

    protected convertToElement(id: number): Group {
        let group: Group = null;
        this.groups.forEach(value => {
            if (value.id === id) {
                group = value;
                return;
            }
        });
        return undefined;
    }

    protected convertToId(element: Group): number {
        return element.id;
    }

    private findIndex(id: number): number {
        let index = -1;
        this.groups.forEach((value, i) => {
            if (value.id === id) {
                index = i;
                return;
            }
        });
        return index;
    }
}
