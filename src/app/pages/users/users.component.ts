import { Component, OnInit, signal, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { UserService } from './Services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../profiles/Services/profile.service';
import { User } from '../../models/user.model';
import { Profile } from '../../models/profile.model';
import { HttpErrorResponse } from '@angular/common/http';
import { NewUserComponent } from './new-user/new-user.component';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

@Component({
    selector: 'app-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        MultiSelectModule,
        InputNumberModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        FileUploadModule,
        NewUserComponent
    ],
    templateUrl: 'users.component.html',
    providers: [MessageService, ProfileService, UserService, ConfirmationService]
})
export class Users implements OnInit {
    private authService = inject(AuthService);
    userDialog: boolean = false;
    loadingUsers: boolean = false;
    loadingPdf: boolean = false;
    loadingXlsx: boolean = false;
    processing: boolean = false;
    search: string = '';

    users = signal<User[]>([]);
    //Equivalente a Objeto o Form en Vue
    user = signal<User>({
        user: '',
        name: '',
        telephone: '',
        profiles: []
    });

    errors = signal<Record<string, string>>({});

    profiles = signal<Profile[]>([]);
    //Columnas para PrimeNg
    cols: Column[] = [
            { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
            { field: 'name', header: 'Name' },
            { field: 'image', header: 'Image' },
            { field: 'price', header: 'Price' },
            { field: 'category', header: 'Category' }
        ];

    constructor(
        private userService: UserService,
        private profileService: ProfileService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadUsers();
        this.loadProfiles();
    }

    can(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    //Carga de perfiles
    loadProfiles() {
        //Realizamos petición
        this.profileService.getProfiles().subscribe({
            next: (data) => {
                //Asignamos valores
                this.profiles.set(data);
            },
            error: (err) => console.error('Error cargando perfiles:', err)
        });
    }

    //Carga de usuarios
    loadUsers(search?: string) {
        this.loadingUsers = true;
        //Realizamos petición
        this.userService.getUsers(search).subscribe({
            next: (data) => {
                //Asignamos valores
                this.users.set(data);
                this.processing = false;
                this.loadingUsers = false;
            },
            error: (err) => console.error('Error cargando usuarios:', err)
        });
    }

    //Filtro local en front
    onGlobalFilter() {
        this.loadUsers(this.search);
    }

    //Resetear objecto signal de user y abrimos dialogo
    openNew() {
        this.user.set({
            user: '',
            name: '',
            telephone: '',
            profiles: []
        });
        this.userDialog = true;
    }

    //cerrar dialogo
    closeDialog(){
        this.userDialog = false;
    }

    //Establecemos valores para User y abrimos dialogo
    editUser(user: User) {
        this.user.set({ ...user });
        this.userDialog = true;
    }

    //Eliminación de usuario
    deleteUser(user: User) {
        const userId = user.id;
        if (!userId) return;
        this.confirmationService.confirm({
            message: 'Estás seguro que quieres eliminar a ' + user.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.userService.deleteUser(userId).subscribe({
                    next: (res:string) => {
                        this.loadUsers();
                        this.showToast({type:'success',message: res});
                    },
                    error: (err) => console.error('Error eliminando el usuario:', err)
                });
            }
        });
    }

    // Función genérica para descargar archivos Blob
    private downloadFile(blob: Blob, fileName: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    //Exportar a pdf
    exportPdf() {
        this.loadingPdf = true;
        this.userService.exportPdf(this.search).subscribe({
            next: (blob: Blob) => {
                this.downloadFile(blob, `reporte_usuarios_${new Date().getTime()}.pdf`);
                this.loadingPdf=false;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al exportar Excel:', err);
                this.loadingPdf = false;
            }
        });
    }

    //Exportar a Xlsx
    exportXlsx() {
        this.loadingXlsx = true;
            this.userService.exportExcel(this.search).subscribe({
            next: (blob: Blob) => {
                this.downloadFile(blob, `usuarios_${new Date().getTime()}.xlsx`);
                this.loadingXlsx=false;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al exportar Excel:', err);
                this.loadingXlsx = false;
            }
        });
    }

    //Agregar un nuevo mensaje a la pantala(toast)
    showToast(data: {type:string, message: string}){
        this.messageService.add({
            severity: data.type,
            summary: data.message,
            life: 3000
        });
    }

}
