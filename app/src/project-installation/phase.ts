import {Step} from './step';

export class Phase {
  steps: Array<Step> = [];
  checked: boolean = true;

  constructor(public description: string) {
  }

  addStep(step: Step) {
    if(this.steps.findIndex(x => x.identifier === step.identifier) > -1) {
      throw new Error(`The post install step ${step.identifier} already exists`);
    }

    if (!step.order) {
      if (this.steps.length > 0) {
        step.order = this._getHighestOrder();
      } else {
        step.order = 1;
      }
    }

    this.steps.push(step);
  }

  stepExists(identifier: string) {
    return this.steps.findIndex(x => x.identifier === identifier) > -1;
  }

  getStep(identifier: string) {
    return this.steps.find(x => x.identifier === identifier);
  }

  _getHighestOrder() {
    return Math.max(...this.steps.map(x => x.order)) + 1;
  }

  sort() {
    this.steps = this.steps.sort((a, b) => a.order - b.order);
  }

  moveAfter(a: Step, b: Step) {
    if (this.steps.findIndex(x => x.order === b.order + 1) > -1) {
      this.steps.forEach(step => {
        if (step.order > b.order) {
          step.order ++;
        }
      });
    }

    a.order = b.order + 1;
  }
}