import {FileSelectorModal} from '../../shared/file-selector-modal';
import {DialogService, FS, LogManager, autoinject, Logger, ApplicationState, Project}  from '../../shared/index';

const logger = <Logger>LogManager.getLogger('aurelia-cli-detection');

@autoinject()
export class Detection {

  constructor(private dialogService: DialogService,
              private state: ApplicationState) {}

  async findAureliaJSONConfig(project: Project) {
    let lookupPaths = [
      FS.join(project.path, 'aurelia_project', 'aurelia.json')
    ];

    for (let i = 0; i < lookupPaths.length; i++) {
      if (await FS.fileExists(lookupPaths[i])) {
        project.aureliaJSONPath = lookupPaths[i];
        logger.info(`aurelia.json found: ${project.aureliaJSONPath}`);
      }
    };

    if (!project.aureliaJSONPath) {
      logger.info(`did not find aurelia.json file`);
    }
  }

  async manualDetection(project: Project) {
    let result = await this.dialogService.open({
      viewModel: FileSelectorModal,
      model: {
        description: 'In order to enable AureliaCLI features, please select the aurelia.json file',
        expectedFileName: 'aurelia.json',
        filters: [
          { name: 'JSON', extensions: ['json'] }
        ]
      }
    });

    if (!result.wasCancelled) {
      project.aureliaJSONPath = result.output;

      await this.state._save();
    }
  }
}