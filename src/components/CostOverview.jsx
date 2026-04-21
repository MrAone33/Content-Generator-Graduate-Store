import React from 'react';
import { DollarSign } from 'lucide-react';

const MODELS = [
    {
        name: 'Claude Sonnet 4.6',
        id: 'claude-sonnet-4-6',
        provider: 'Anthropic',
        inputPer1M: 3,
        outputPer1M: 15,
    },
    {
        name: 'Seedream 4.5',
        id: 'seedream-4-5-251128',
        provider: 'ByteDance',
        perImage: 0.04,
    },
];

// Estimated token usage per generation type
const PROJECTIONS = [
    {
        label: 'Article Cocon',
        description: 'Draft + Rewrite + Image',
        steps: [
            { model: 'Claude Sonnet 4.6', inputTokens: 3000, outputTokens: 2500, label: 'Brouillon (Draft)' },
            { model: 'Claude Sonnet 4.6', inputTokens: 5000, outputTokens: 3500, label: 'Réécriture (Rewrite)' },
            { model: 'Claude Sonnet 4.6', inputTokens: 600, outputTokens: 200, label: 'Prompt image' },
            { model: 'Seedream 4.5', images: 1, label: 'Génération image' },
        ],
    },
    {
        label: 'Catégorie Ecom',
        description: 'Draft + Rewrite + Image',
        steps: [
            { model: 'Claude Sonnet 4.6', inputTokens: 3000, outputTokens: 2000, label: 'Brouillon (Draft)' },
            { model: 'Claude Sonnet 4.6', inputTokens: 4500, outputTokens: 3000, label: 'Réécriture (Rewrite)' },
            { model: 'Claude Sonnet 4.6', inputTokens: 600, outputTokens: 200, label: 'Prompt image' },
            { model: 'Seedream 4.5', images: 1, label: 'Génération image' },
        ],
    },
    {
        label: 'Marque Ecom',
        description: 'Draft + Rewrite + Image',
        steps: [
            { model: 'Claude Sonnet 4.6', inputTokens: 3000, outputTokens: 2500, label: 'Brouillon (Draft)' },
            { model: 'Claude Sonnet 4.6', inputTokens: 5000, outputTokens: 3500, label: 'Réécriture (Rewrite)' },
            { model: 'Claude Sonnet 4.6', inputTokens: 600, outputTokens: 200, label: 'Prompt image' },
            { model: 'Seedream 4.5', images: 1, label: 'Génération image' },
        ],
    },
    {
        label: 'Image seule',
        description: 'Prompt + Génération',
        steps: [
            { model: 'Claude Sonnet 4.6', inputTokens: 600, outputTokens: 200, label: 'Prompt image' },
            { model: 'Seedream 4.5', images: 1, label: 'Génération image' },
        ],
    },
];

function computeStepCost(step) {
    if (step.images) {
        const model = MODELS.find(m => m.name === step.model);
        return model ? model.perImage * step.images : 0;
    }
    const model = MODELS.find(m => m.name === step.model);
    if (!model) return 0;
    const inputCost = (step.inputTokens / 1_000_000) * model.inputPer1M;
    const outputCost = (step.outputTokens / 1_000_000) * model.outputPer1M;
    return inputCost + outputCost;
}

function computeProjectionCost(projection) {
    return projection.steps.reduce((sum, step) => sum + computeStepCost(step), 0);
}

function formatCost(cost) {
    if (cost < 0.01) return `~${(cost * 100).toFixed(2)}c`;
    return `~$${cost.toFixed(3)}`;
}

export default function CostOverview() {
    return (
        <div className="space-y-8">
            {/* Models pricing */}
            <div className="bg-white border border-[#E5E5E5] rounded overflow-hidden">
                <div className="px-5 py-3 border-b border-[#E5E5E5] flex items-center gap-2 bg-[#F5F5F5]">
                    <DollarSign className="w-4 h-4 text-black" />
                    <h2 className="font-semibold text-black text-sm uppercase tracking-wide">Tarifs des modèles</h2>
                </div>
                <div className="p-5 space-y-3">
                    {MODELS.map((model) => (
                        <div key={model.id} className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-black">{model.name}</span>
                                <span className="text-xs text-[#999] font-medium">{model.provider}</span>
                            </div>
                            <p className="text-[10px] text-[#999] font-mono mb-2">{model.id}</p>
                            {model.perImage !== undefined ? (
                                <p className="text-sm text-[#767676]">
                                    <span className="font-medium text-black">${model.perImage.toFixed(2)}</span> / image
                                </p>
                            ) : (
                                <div className="flex gap-6">
                                    <p className="text-sm text-[#767676]">
                                        <span className="font-medium text-black">${model.inputPer1M}</span> / 1M tokens input
                                    </p>
                                    <p className="text-sm text-[#767676]">
                                        <span className="font-medium text-black">${model.outputPer1M}</span> / 1M tokens output
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Projections */}
            <div className="bg-white border border-[#E5E5E5] rounded overflow-hidden">
                <div className="px-5 py-3 border-b border-[#E5E5E5] bg-[#F5F5F5]">
                    <h2 className="font-semibold text-black text-sm uppercase tracking-wide">Coût estimé par génération</h2>
                </div>
                <div className="p-5 space-y-3">
                    {PROJECTIONS.map((proj) => {
                        const totalCost = computeProjectionCost(proj);
                        return (
                            <div key={proj.label} className="border border-[#E5E5E5] rounded-sm overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-white">
                                    <div>
                                        <span className="text-sm font-semibold text-black">{proj.label}</span>
                                        <span className="text-xs text-[#999] ml-2">{proj.description}</span>
                                    </div>
                                    <span className="text-sm font-bold text-black tabular-nums">{formatCost(totalCost)}</span>
                                </div>
                                <div className="px-4 pb-3 pt-2 bg-[#FAFAFA] border-t border-[#F0F0F0]">
                                    {proj.steps.map((step, i) => (
                                        <div key={i} className="flex items-center justify-between py-0.5">
                                            <span className="text-xs text-[#999]">{step.label}</span>
                                            <span className="text-xs text-[#999] tabular-nums">{formatCost(computeStepCost(step))}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    <p className="text-xs text-[#999] mt-4 leading-relaxed">
                        Estimations basées sur une utilisation moyenne. Le coût réel varie selon la longueur du contenu, le contexte SERP et les options sélectionnées.
                    </p>
                </div>
            </div>
        </div>
    );
}
