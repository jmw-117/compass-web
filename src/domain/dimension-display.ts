import type {DimensionId, ReadinessResult} from './evaluate.ts';

const labels: Record<DimensionId, string> = {
  STR: 'Strategy', PRO: 'Processes', DAT: 'Data', TEC: 'Technology',
  PEO: 'People', GOV: 'Governance', MET: 'Measurement',
};

export function getDimensionLabel(id: string) {
  return Object.hasOwn(labels, id) ? labels[id as DimensionId] : id;
}

export function dimensionRows(dimensions: ReadinessResult['dimensions']) {
  return (Object.keys(labels) as DimensionId[]).map(dimension => {
    const metric = dimensions[dimension];
    const lower = metric.lower * 25;
    const upper = metric.upper * 25;
    return {
      dimension, label: labels[dimension], lower, upper, known: metric.known,
      scoreText: lower === upper ? Math.round(lower) + '%' : Math.floor(lower) + '–' + Math.ceil(upper) + '%',
    };
  });
}
