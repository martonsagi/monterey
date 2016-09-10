import {bindable, autoinject} from 'aurelia-framework';
import {CommandRunnerService} from './command-runner-service';
import {Notification}         from '../../shared/notification';
import {Project}              from '../../shared/project';
import {ApplicationState}     from '../../shared/application-state';
import {CommandRunner}        from './command-runner';
import {Command}              from './command';
import {TaskManager}          from './task-manager';
import {Task}                 from './task';

@autoinject()
export class TaskRunner {
  @bindable project: Project;
  favoriteTab: Element;
  favoriteTabBody: Element;
  loading: boolean;

  constructor(private taskManager: TaskManager,
              private commandRunner: CommandRunner,
              private state: ApplicationState,
              private notification: Notification) {}

  projectChanged() {
    if (!this.project) {
      return;
    }

    if (!this.project.__meta__.taskrunner) {
      this.project.__meta__.taskrunner = {};
    }

    let taskrunner = this.project.__meta__.taskrunner;
    if (!taskrunner.categories) taskrunner.categories = [];
    if (!taskrunner.favorites) taskrunner.favorites = [];

    taskrunner.categories.splice(0);
    taskrunner.favorites.splice(0);

    if (!this.project.favoriteCommands) {
      this.project.favoriteCommands = [
        'gulp watch',
        'au run --watch',
        'npm start',
        'dotnet restore',
        'gulp prepare-release'
      ];
    }

    if (this.favoriteTab) {
      this.showFavoriteTab();
    } else {
      setTimeout(() => this.showFavoriteTab());
    }

    this.load(this.project);
  }

  showFavoriteTab() {
    if (this.favoriteTab) {
      $(this.favoriteTab).tab('show');
      $(this.favoriteTab).show();
    }
  }

  async load(project: Project) {
    project.__meta__.taskrunner.loading = true;

    let categories: Array<Category> = [];
    let services = await this.commandRunner.getServices(project);

    services.forEach(service => categories.push({
      title: service.title,
      service: service,
      commands: []
    }));

    for (let x = 0; x < categories.length; x++) {
      await this.loadCommands(project, categories[x], true);
    }

    project.__meta__.taskrunner.categories = categories;
    project.__meta__.taskrunner.loading = false;

    this.loadFavorites(project);
  }

  loadFavorites(project: Project) {
    if (!project.favoriteCommands) return;

    let taskrunner = project.__meta__.taskrunner;
    let categories = <Array<Category>>taskrunner.categories;
    let favorites = <Array<Favorite>>taskrunner.favorites;

    categories.forEach((category: Category) => {
      category.commands.forEach(command => {
        if (project.favoriteCommands.indexOf(command.description) > -1) {
          favorites.push({
            category: category,
            command: command
          });
        }
      });
    });
  }

  async loadCommands(project: Project, category: Category, useCache: boolean) {
    category.commands.splice(0);
    category.selectedCommand = null;
    category.error = '';
    category.loading = true;
    category.selectedCommand = null;

    try {
      category.commands = await category.service.getCommands(project, useCache);
      category.commands.forEach(command => command.description = `${command.command} ${command.args.join(' ')}`);
    } catch (e) {
      category.error = `Failed to load tasks for this project (${e.message}). Did you install the npm modules?`;
    }
    category.loading = false;

    if (!category.error && category.commands && category.commands.length === 0) {
      category.error = `Did not find any tasks`;
    }
  }

  startCommand(category: Category, command?: Command) {
    if (!command && !category.selectedCommand) {
      this.notification.warning('No task has been selected');
      return;
    }

    let task = this.commandRunner.run(this.project, command || category.selectedCommand);

    this.taskManager.addTask(this.project, task);
    this.taskManager.startTask(task);

    this.notification.success('Task has been started');
  }

  favoriteCommand(category: Category) {
    let taskrunner = this.project.__meta__.taskrunner;
    let favorites = <Array<Favorite>>taskrunner.favorites;

    favorites.push({
      category: category,
      command: category.selectedCommand
    });

    this.project.favoriteCommands.push(category.selectedCommand.description);
    this.state._save();
    this.notification.success('Added the task to favorites');
  }
}

interface Category {
  service?: CommandRunnerService;
  commands: Array<Command>;
  selectedCommand?: Command;
  error?: string;
  loading?: boolean;
  title: string;
}

interface Favorite {
  category: Category;
  command: Command;
}