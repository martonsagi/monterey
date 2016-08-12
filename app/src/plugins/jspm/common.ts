import {autoinject}       from 'aurelia-framework';
import {JSPM, FS}         from 'monterey-pal';
import {TaskManager}      from '../../plugins/task-manager/task-manager';
import {Task}             from '../../plugins/task-manager/task';
import {Project}          from '../../shared/project';

@autoinject()
export class Common {

  constructor(private taskManager: TaskManager) {}

  install(project: Project, deps, jspmOptions = null, withLoader = false) {

    let workingDirectory = FS.getFolderPath(project.packageJSONPath);

    // always supply a workingDirectory so that
    // we're not jspm installing in monterey directory
    Object.assign(jspmOptions, {
      workingDirectory: workingDirectory
    });

    let task = <Task>{
      title: `jspm install of '${project.name}'`,
      estimation: 'This usually takes about a minute to complete',
      logs: [],
      promise: null
    };

    let promise = JSPM.install(deps, {
      project: project,
      jspmOptions: jspmOptions,
      logCallback: (message) => {
        this.taskManager.addTaskLog(task, message.message);
      }
    });

    if (withLoader) {
      promise = promise.then(() => this.downloadLoader(project, (message) => {
        this.taskManager.addTaskLog(task, message.message);
      }));
    }

    task.promise = promise;

    this.taskManager.addTask(task);

    return task;
  }

  downloadLoader(project: Project, callback) {
    let workingDirectory = FS.getFolderPath(project.packageJSONPath);

    return JSPM.downloadLoader({
      project: project,
      jspmOptions: {
        workingDirectory: workingDirectory
      },
      logCallback: callback
    });
  }
}