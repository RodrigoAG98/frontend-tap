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
import { ProfileService } from './Services/profile.service';
import { PermissionService } from '../../core/services/permission.service';
import { Profile } from '../../models/profile.model';
import { Permission } from '../../models/permission.model';
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
    ],
    templateUrl: 'profiles.component.html',
    providers: [MessageService, ProfileService, ConfirmationService, PermissionService]
})
export class Profiles implements OnInit {
    profileDialog: boolean = false;
    loadingProfiles: boolean = false;
    loadingPdf: boolean = false;
    loadingXlsx: boolean = false;
    processing: boolean = false;
    search: string = '';

    profiles = signal<Profile[]>([]);
    //Equivalente a Objeto o Form en Vue
    profile = signal<Profile>({
        profile_code: '',
        name: '',
        sections: [],
    });

    permissions = signal<Permission[]>([]);

    errors = signal<Record<string, string>>({});

    //Columnas para PrimeNg
    cols: Column[] = [
            { field: 'profile_code', header: 'Code', customExportHeader: 'Product Code' },
            { field: 'name', header: 'Name' },
            { field: 'created_at', header: 'Fecha de creación' },
        ];

    constructor(
        private profileService: ProfileService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private permissionService: PermissionService,
    ) {}

    ngOnInit() {
        this.loadProfiles();
        this.loadPermissions();
    }

    //Carga de usuarios
    loadProfiles(search?: string) {
        this.loadingProfiles = true;
        //Realizamos petición
        this.profileService.getProfiles(search).subscribe({
            next: (data) => {
                //Asignamos valores
                this.profiles.set(data);
                this.processing = false;
                this.loadingProfiles = false;
            },
            error: (err) => console.error('Error cargando perfiles:', err)
        });
    }

    //Filtro local en front
    onGlobalFilter() {
        this.loadProfiles(this.search);
    }

    //Resetear objecto signal de user y abrimos dialogo
    openNew() {
        this.profile.set({
            profile_code: '',
            name: '',
            sections: []
        });
        this.profileDialog = true;
    }

    //Establecemos valores para User y abrimos dialogo
    editProfile(profile: Profile) {
        this.profile.set({ ...profile });
        this.profileDialog = true;
    }

    //Cerramos dialogo y limpiamos errores
    hideDialog() {
        this.profileDialog = false;
        this.errors.set({});
    }

    //Eliminación de usuario
    deleteProfile(profile: Profile) {
        const userId = profile.id;
        if (!userId) return;
        this.confirmationService.confirm({
            message: 'Estás seguro que quieres eliminar a ' + profile.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.profileService.deleteProfile(userId).subscribe({
                    next: (res:string) => {
                        this.loadProfiles();
                        this.showToast('success',res);
                    },
                    error: (err) => console.error('Error eliminando el perfil:', err)
                });
            }
        });
    }

    //Guardar o actualizar según sea el caso
    saveProfile() {
        this.errors.set({});
        this.processing = true;
        const userId = this.profile().id;
        //Sino existe un id creamos nuevo usuario
        if (!userId){
            const newProfile: Profile = {
                profile_code: this.profile().profile_code,
                name: this.profile().name,
                sections: this.profile().sections
            };
            this.profileService.createProfile(newProfile).subscribe({
                next: (res:string) => {
                    this.processing = false;
                    this.loadProfiles();
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
            const updatedProfile: Profile = {
                id: this.profile().id,
                profile_code: this.profile().profile_code,
                name: this.profile().name,
                sections: this.profile().sections
            };
            this.profileService.updateProfile(userId, updatedProfile).subscribe({
                next: (res:string) => {
                    this.processing = false;
                    this.loadProfiles();
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
        this.profileService.exportPdf(this.search).subscribe({
            next: (blob: Blob) => {
                this.downloadFile(blob, `reporte_perfiles_${new Date().getTime()}.pdf`);
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
            this.profileService.exportExcel(this.search).subscribe({
            next: (blob: Blob) => {
                this.downloadFile(blob, `perfiles_${new Date().getTime()}.xlsx`);
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

    loadPermissions(){
        this.permissionService.getPermissions().subscribe({
            next: (data) => {
                //Asignamos valores
                this.permissions.set(data);
            },
            error: (err) => console.error('Error cargando permisos:', err)
        });
    }
}
