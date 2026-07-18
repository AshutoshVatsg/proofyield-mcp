import { Module } from '@nitrostack/core';
import { DiscoveryTools } from './discovery.tools.js';
import { DiscoveryResources } from './discovery.resources.js';
import { DiscoveryPrompts } from './discovery.prompts.js';
import { SharedModule } from '../shared/shared.module.js';

@Module({
  name: 'discovery',
  description: 'ProofYield Discovery Module',
  imports: [SharedModule],
  controllers: [DiscoveryTools, DiscoveryResources, DiscoveryPrompts],
})
export class DiscoveryModule {}
