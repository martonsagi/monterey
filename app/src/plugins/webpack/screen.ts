import {Project}              from '../../shared/project';
import {ApplicationState}     from '../../shared/application-state';
import {inject, NewInstance}  from 'aurelia-framework';
import {ValidationRules}      from 'aurelia-validatejs';
import {ValidationController} from 'aurelia-validation';
import {Notification}         from '../../shared/notification';
import {FS}                   from 'monterey-pal';

@inject(ApplicationState, NewInstance.of(ValidationController), Notification)
export class Screen {
  project: Project;

  constructor(private state: ApplicationState,
              private validation: ValidationController,
              private notification: Notification) {
  }

  async activate(model) {
    this.project = model.selectedProject;
  }

  async browser() {
    let paths = await FS.showOpenDialog({
      title: 'Select webpack.config.js',
      properties: ['openFile'],
      defaultPath: this.project.path,
      filters: [
        { name: 'Javascript', extensions: ['js'] }
      ]
    });

    if (paths.length === 1) {
      this.project.aureliaJSONPath = paths[0];
    } else {
      this.notification.error('Please select one webpack.config.js file');
    }
  }

  async save() {
    if (this.validation.validate().length > 0) {
      this.notification.error('There are validation errors');
      return;
    }

    await this.state._save();
    this.notification.success('Changes saved');
  }
}