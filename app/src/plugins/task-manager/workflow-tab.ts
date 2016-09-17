import {bindable, autoinject} from 'aurelia-framework';
import {CommandTree}          from '../workflow/command-tree';
import {WorkflowCreator}      from './workflow-creator';
import {ApplicationState, Notification, Project} from '../../shared/index';

@autoinject()
export class WorkflowTab {
  @bindable state: { project: Project };
  trees: Array<CommandTree> = [];
  selectedTree: CommandTree;
  creator: WorkflowCreator;

  constructor(private appState: ApplicationState,
              private notification: Notification) {}

  stateChanged() {
    if (!this.state) return;

    let project = this.state.project;
    this.trees = JSON.parse(JSON.stringify(project.workflowTrees));

    if (this.trees.length > 0) {
      this.selectedTree = this.trees[0];
    } else {
      this.selectedTree = null;
    }
  }

  createNew() {
    this.trees.push(new CommandTree({}));

    this.selectedTree = this.trees[this.trees.length - 1];
  }

  remove() {
    if (!this.selectedTree) {
      alert('Please select a workflow');
      return;
    }

    if (!confirm(`Are you sure that you want to remove the "${this.selectedTree.name}"?`)) {
      return;
    }


    this.trees.splice(this.trees.indexOf(this.selectedTree), 1);

    if (this.trees.length > 0) {
      this.selectedTree = this.trees[0];
    } else {
      this.selectedTree = null;
    }
  }

  async save() {
    this.creator.refreshTree();

    this.state.project.workflowTrees = JSON.parse(JSON.stringify(this.trees));

    await this.appState._save();
    this.notification.success('Saved');
  }

  async addAsTile() {
    if (!this.selectedTree) {
      alert('Please select a workflow');
      return;
    }

    if (!this.selectedTree.tile) {
      this.selectedTree.tile = true;
    } else {
      this.selectedTree.tile = false;
    }

    await this.appState._save();

    this.notification.success(`Tile ${this.selectedTree.tile ? 'enabled'  : 'disabled'} for ${this.selectedTree.name}`);
  }
}