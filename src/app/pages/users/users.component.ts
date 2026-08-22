import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserService } from './Services/user.service';
import { User } from '../../models/user.model';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule
    ],
    templateUrl: 'users.component.html',
    providers: [MessageService, UserService, ConfirmationService]
})
export class Users implements OnInit {
    productDialog: boolean = false;

    users = signal<User[]>([]);

    user = signal<User>({
        user: '',
        name: '',
        telephone: '',
        profiles: []
    });

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols: Column[] = [
            { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
            { field: 'name', header: 'Name' },
            { field: 'image', header: 'Image' },
            { field: 'price', header: 'Price' },
            { field: 'category', header: 'Category' }
        ];

    constructor(
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getUsers().subscribe({
            next: (data) => this.users.set(data),
            error: (err) => console.error('Error cargando usuarios:', err)
        });
        console.log(this.users());
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.user.set({
            user: '',
            name: '',
            telephone: '',
            profiles: []
        });
        this.submitted = false;
        this.productDialog = true;
    }

    editUser(user: User) {
        this.user.set({ ...user });
        this.productDialog = true;
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    deleteUser(user: User) {
        const userId = this.user().id;
        if (!userId) return;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + user.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userService.deleteUser(userId).subscribe({
                    next: () => {
                        this.users.update((current) => current.filter((t) => t.id !== user.id));
                    }
                });
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Deleted',
                    life: 3000
                });
            }
        });
    }

    saveUser() {
        this.submitted = true;
        const userId = this.user().id;
        if (!userId){
            const newUser: User = {
                user: this.user().user,
                name: this.user().name,
                telephone: this.user().telephone,
                profiles: this.user().profiles,
            };
            this.userService.createUser(newUser).subscribe({
                next: (createdUser) => {
                    this.users.update((current) => [createdUser, ...current]);
                    this.user.set({
                        user: '',
                        name: '',
                        telephone: '',
                        profiles: []
                    });
                }
            });
        }else{
            const updatedUser: User = {
                id: this.user().id,
                user: this.user().user,
                name: this.user().name,
                telephone: this.user().telephone,
                profiles: this.user().profiles,
            };
            this.userService.updateUser(userId, updatedUser).subscribe({
                next: (updatedUser) => {
                    this.users.update((current) =>
                        current.map((t) => (t.id === updatedUser.id ? updatedUser : t))
                    );
                    this.user.set({
                        user: '',
                        name: '',
                        telephone: '',
                        profiles: []
                    });
                }
            });
        }
    }
}
