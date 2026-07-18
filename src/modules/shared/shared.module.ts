import { Module } from '@nitrostack/core';
import { ProofYieldConfigService } from './config.service.js';
import { ReceiptRepository } from './receipt.repository.js';
import { EvidenceRepository } from './evidence.repository.js';

@Module({
  name: 'shared',
  description: 'Shared configuration and state services',
  providers: [ProofYieldConfigService, ReceiptRepository, EvidenceRepository],
  exports: [ProofYieldConfigService, ReceiptRepository, EvidenceRepository]
})
export class SharedModule {}
