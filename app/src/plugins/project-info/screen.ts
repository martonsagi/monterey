import {autoinject}    from 'aurelia-framework';
import {PluginManager} from '../../shared/plugin-manager';

@autoinject()
export class Screen {
  project;
  sections = [];
  clipboard: Clipboard;

  constructor(private pluginManager: PluginManager) {
  }

  async activate(model) {
    this.project = model.selectedProject;

    // allow plugins to provide a list of view/viewmodels that should be rendered here
    this.pluginManager.plugins.forEach(async plugin => {
      let sections = await plugin.getProjectInfoSections(this.project);
      (sections || []).forEach(section => {
        if (!section.model) {
          section.model = {
            project: this.project
          };
        }

        this.sections.push(section);
      });
    });
  }

  attached() {
    this.clipboard = new Clipboard('.copy-btn', {
        text: function(trigger) {
          return (<any>$('.copyable-item')).text();
        }
    });

    this.clipboard.on('success', function(e) {
      alert('copied project information to clipboard');
    });

    this.clipboard.on('error', function(e) {
      alert(`failed to copy project information to clipboard: ${e.text}`);
      console.log(e);
    });
  }

  detached() {
    this.clipboard.destroy();
  }
}
