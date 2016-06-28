import {Router}         from 'aurelia-router';
import {ProjectManager} from '../shared/project-manager';

export function configure(aurelia) {
  let router = aurelia.container.get(Router);
  let projectManager = aurelia.container.get(ProjectManager);

  router.addRoute({ route: 'landing', name: 'landing', moduleId: './landing/landing' });

  if (!projectManager.hasProjects()) {
    router.addRoute({ route: '', redirect: 'landing' });
  }
}
