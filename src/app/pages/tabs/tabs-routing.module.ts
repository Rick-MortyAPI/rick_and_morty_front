import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        path: 'tab4',
        loadChildren: () => import('../pagina1/pagina1.module').then(m => m.Pagina1PageModule)
      },
      {
        path: 'tab5',
        loadChildren: () => import('../camara/camara.module').then(m => m.CamaraPageModule)
      },
      {
        path: '',
        redirectTo: 'tab1', // Redirige a tab1 por defecto
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tabs', // Asegúrate de que no se duplique la ruta
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule] // Asegúrate de exportar RouterModule
})
export class TabsPageRoutingModule {}
