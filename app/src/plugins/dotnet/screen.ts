import {autoinject}       from 'aurelia-framework';
import {SelectedProject}  from '../../shared/selected-project';
import {Main}             from '../../main/main';

@autoinject()
export class Screen {

  constructor(private main: Main,
              private selectedProject: SelectedProject) {
  }

  goBack() {
    this.main.returnToPluginList();
  }
}