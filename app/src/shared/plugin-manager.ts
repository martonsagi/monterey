import {BasePlugin}       from '../plugins/base-plugin';
import {Project}          from './project';
import {ApplicationState} from './application-state';

export class PluginManager {

  plugins: Array<BasePlugin> = [];

  /**
  * At application startup all plugins must register themselves with the PluginManager
  */
  registerPlugin(plugin: BasePlugin) {
    this.plugins.push(plugin);
  }

  /**
  * Whenever a project gets added to monterey, plugins have the opportunity
  * to evaluate the project and provide information of it to the monterey system
  */
  async evaluateProject(project: Project) {
    await this.call('evaluateProject', project);
    return project;
  }

  /**
   * Notifies every plugin of the fact that a new Monterey session has started
   */
  async notifyOfNewSession(state: ApplicationState) {
    await this.call('onNewSession', state);
    return state;
  }

  /**
   * Notifies every project of the fact that a project has been added to Monterey
   */
  async notifyOfAddedProject(project: Project) {
    await this.call('onProjectAdd', project);
    return project;
  }

  async getTaskBarItems(project: Project): Promise<Array<string>> {
    let items = await this.call('getTaskBarItems', project);
    return items;
  }

  /**
   * Call a function on all plugins
   */
  private async call(func: string, ...params) {
    let result = [];
    let p = Array.prototype.slice.call(params);
    for (let i = 0; i < this.plugins.length; i++) {
      result = result.concat(await this.plugins[i][func].apply(this.plugins[i], p));
    }
    return result;
  }

  /**
  * Collects an array of tiles by calling the getTiles function of every plugin
  */
  getTilesForPlugin(project: Project, showIrrelevant: boolean) {
    let tiles = [];

    this.plugins.forEach(plugin => {
      plugin.getTiles(project, showIrrelevant)
      .forEach(tile => tiles.push(tile));
    });

    return tiles;
  }
}
