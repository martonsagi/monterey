import {OS, ELECTRON, FS} from 'monterey-pal';
import {Notifications, Notification} from '../plugins/notifications/notifications';
import {GithubAPI, autoinject, Settings, DialogService, Notification as Toastr, IPC, Logger, LogManager} from '../shared/index';

const logger = <Logger>LogManager.getLogger('updater');

@autoinject()
export class Updater {
  constructor(private githubAPI: GithubAPI,
              private dialogService: DialogService,
              private toastr: Toastr,
              private notifications: Notifications,
              private settings: Settings,
              private ipc: IPC) {}

  async checkForUpdate() {
    if (!this.settings.getValue('check-for-updates')) {
      return;
    }

    if (!await this.needUpdate()) {
      logger.info('Update not needed');
      return;
    }

    logger.info('Update available, showing notification');

    this.notifications.add({
      title: 'Update available',
      icon: 'fa fa-arrow-up',
      viewModel: 'updater/update-screen',
      model: {},
      type: 'Update'
    } as Notification);
  }

  async update(eventCallback: (event, ...args) => void) {
    ELECTRON.getGlobal('update')(eventCallback);
  }

  async needUpdate() {
    try {
      let release = await this.githubAPI.getLatestRelease('monterey-framework/monterey');
      let latestVersion = release.name;

      let currentVersion = await this._getCurrentVersion();

      logger.info(`Current version: ${currentVersion}, latest version: ${latestVersion}`);

      return latestVersion !== currentVersion;
    } catch (error) {
      if (error.status === 401) {
        this.toastr.info('Could not check for updates. GitHub returned "Unauthorized"');
      }
      return false;
    }
  }

  async _getCurrentVersion() {
    let packageJSON = JSON.parse(await FS.readFile(FS.join(FS.getRootDir(), 'package.json')));
    return `v${packageJSON.version}`;
  }
}