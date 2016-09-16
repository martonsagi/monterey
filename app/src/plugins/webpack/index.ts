import {autoinject}       from 'aurelia-framework';
import {PluginManager}    from '../../shared/plugin-manager';
import {Detection}        from './detection';
import {BasePlugin}       from '../base-plugin';
import {Project}          from '../../shared/project';
import {Task}             from '../task-manager/task';
import {Workflow}         from '../workflow/workflow';
import {Step}             from '../workflow/step';
import {CommandService}   from './command-service';
import {CommandRunner}    from '../task-manager/command-runner';

export function configure(aurelia) {
  let pluginManager = <PluginManager>aurelia.container.get(PluginManager);

  pluginManager.registerPlugin(aurelia.container.get(Plugin));
}

@autoinject()
export class Plugin extends BasePlugin {
  constructor(private detection: Detection,
              private commandRunner: CommandRunner) {
    super();
  }

  getTiles(project: Project, showIrrelevant) {
    if (!showIrrelevant && !project.isUsingWebpack()) {
      return [];
    }

    return [{
      name: 'webpack',
      model: { relevant: !!project.isUsingWebpack() },
      viewModel: 'plugins/webpack/tile'
    }];
  }

  async evaluateProject(project: Project) {
    await this.detection.findWebpackConfig(project);

    if (project.isUsingWebpack()) {
      let workflow = project.addOrCreateWorkflow('Run');
      workflow.children.push(<any>{
        command: {
          command: 'npm',
          args: ['start']
        }
      });
    }
  }

  async getProjectInfoSections(project: Project) {
    if (project.isUsingWebpack()) {
      return [{ viewModel: 'plugins/webpack/project-info' }];
    }
    return [];
  }

  async resolvePostInstallWorkflow(project: Project, workflow: Workflow) {
    if (!project.isUsingWebpack()) return;

    let runPhase = workflow.getPhase('run');

    if (!runPhase.stepExists('npm start')) {
      runPhase.addStep(new Step('npm start', 'npm start', this.commandRunner.run(project, {
        command: 'npm',
        args: ['start']
      })));
    }
  }

  async getCommandServices(project: Project): Promise<Array<any>> {
    if (!project.isUsingWebpack()) return;

    return [CommandService];
  }
}