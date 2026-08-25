import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { UserService } from './Services/user.service';
import { ProfileService } from '../profiles/Services/profile.service';
import { User } from '../../models/user.model';
import { Profile } from '../../models/profile.model';
import { HttpErrorResponse } from '@angular/common/http';

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
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        FileUploadModule
    ],
    templateUrl: 'users.component.html',
    providers: [MessageService, ProfileService, UserService, ConfirmationService]
})
export class Users implements OnInit {
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
    // Signal para guardar el archivo físico
    selectedFile = signal<File | null>(null);
  
    // Signal para la vista previa en base64
    imagePreview = signal<string | null>(null);

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

    getAvatar() {
        const userId = this.user().id
        if(userId){
            this.userService.avatarUser(userId).subscribe({
                next: (data) => {
                    //Asignamos valores
                    this.imagePreview.set(data);
                },
                error: (err) => console.error('Error obteniendo el avatar:', err)
            });
        }
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
        this.imagePreview.set(null);
        this.userDialog = true;
    }

    //Establecemos valores para User y abrimos dialogo
    editUser(user: User) {
        this.user.set({ ...user });
        this.getAvatar();
        this.userDialog = true;
    }

    //Cerramos dialogo y limpiamos errores
    hideDialog() {
        this.userDialog = false;
        this.selectedFile.set(null);
        this.imagePreview.set(null);
        this.errors.set({});
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
                        this.showToast('success',res);
                    },
                    error: (err) => console.error('Error eliminando el usuario:', err)
                });
            }
        });
    }

    //Guardar o actualizar según sea el caso
    saveUser() {
        this.errors.set({});
        this.processing = true;
        const userId = this.user().id;
        //Sino existe un id creamos nuevo usuario
        if (!userId){
            const newUser: User = {
                user: this.user().user,
                name: this.user().name,
                telephone: this.user().telephone,
                profiles: this.user().profiles,
            };
            const file = this.selectedFile();
            this.userService.createUser(newUser,file).subscribe({
                next: (res:string) => {
                    this.processing = false;
                    this.loadUsers();
                    this.hideDialog();
                    this.showToast('success',res);
                },
                error: (err) => {
                    this.setErrors(err);
                    this.processing = false;
                }
            });
        }else{
            //De otro modo actualizamos el existente
            const updatedUser: User = {
                id: this.user().id,
                user: this.user().user,
                name: this.user().name,
                telephone: this.user().telephone,
                profiles: this.user().profiles,
            };
            const file = this.selectedFile();
            this.userService.updateUser(userId, updatedUser,file).subscribe({
                next: (res:string) => {
                    this.processing = false;
                    this.loadUsers();
                    this.hideDialog();
                    this.showToast('success',res);
                },
                error: (err) => {
                    this.setErrors(err);
                    this.processing = false;
                }
            });
        }
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

    //Manejo de errores
    setErrors(err: HttpErrorResponse) {
        // Capturamos el error 422 de Laravel
        if (err.status === 422 && err.error?.errors) {
            const rawErrors = err.error.errors;
            const formattedErrors: Record<string, string> = {};

            // Extraemos solo el primer mensaje de error de cada campo
            Object.keys(rawErrors).forEach((key) => {
                formattedErrors[key] = rawErrors[key][0];
            });

            // Actualizamos la Signal con los errores procesados
            this.errors.set(formattedErrors);
            this.showToast('warn','Por favor revisa el formulario.');
        }
    }
    //Agregar un nuevo mensaje a la pantala(toast)
    showToast(type: string, msg: string){
        this.messageService.add({
            severity: type,
            summary: msg,
            life: 3000
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
        const file = input.files[0];
        this.selectedFile.set(file);

        // Generar vista previa dinámica
        const reader = new FileReader();
        reader.onload = () => this.imagePreview.set(reader.result as string);
        reader.readAsDataURL(file);
        }
    }
}
