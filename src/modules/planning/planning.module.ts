import { Module } from '@nitrostack/core';
import { PlanningTools } from './planning.tools.js';
import { SharedModule } from '../shared/shared.module.js';

@Module({
  name: 'planning',
  description: 'ProofYield Planning Module',
  imports: [SharedModule],
  controllers: [PlanningTools],
})
export class PlanningModule {}
