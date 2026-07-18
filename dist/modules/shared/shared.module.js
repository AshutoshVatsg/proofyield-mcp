var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nitrostack/core';
import { ProofYieldConfigService } from './config.service.js';
import { ReceiptRepository } from './receipt.repository.js';
import { EvidenceRepository } from './evidence.repository.js';
let SharedModule = class SharedModule {
};
SharedModule = __decorate([
    Module({
        name: 'shared',
        description: 'Shared configuration and state services',
        providers: [ProofYieldConfigService, ReceiptRepository, EvidenceRepository],
        exports: [ProofYieldConfigService, ReceiptRepository, EvidenceRepository]
    })
], SharedModule);
export { SharedModule };
//# sourceMappingURL=shared.module.js.map