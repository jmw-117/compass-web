import contract from '../../docs/domain/decision_predicates.json' with {type: 'json'};

type Expression = {all: Expression[]} | {any: Expression[]} | {not: Expression} | {unknown: string} |
  {eq: [string, unknown]} | {in: [string, unknown[]]} |
  {lte: [string, number]} | {gte: [string, number]} | {lt: [string, number]};

const predicates = contract.predicates as unknown as Record<string, Expression>;
export function matches(id: string, facts: Map<string, unknown>, references?: Set<string>) {
  const expression = predicates[id];
  if (!expression) throw new Error('Missing decision predicate ' + id);
  function visit(node: Expression): boolean {
    // Visit each operand so the evidence list is stable regardless of short-circuiting.
    if ('all' in node) return node.all.map(visit).every(Boolean);
    if ('any' in node) return node.any.map(visit).some(Boolean);
    if ('not' in node) return !visit(node.not);
    if ('unknown' in node) {
      references?.add(node.unknown);
      return facts.get(node.unknown) == null;
    }
    const [key, target] = 'eq' in node ? node.eq : 'in' in node ? node.in :
      'lte' in node ? node.lte : 'gte' in node ? node.gte : node.lt;
    references?.add(key);
    const value = facts.get(key);
    if ('eq' in node) return value === target;
    if ('in' in node) return node.in[1].includes(value);
    if (typeof value !== 'number' || typeof target !== 'number') return false;
    if ('lte' in node) return value <= target;
    if ('gte' in node) return value >= target;
    return value < target;
  }
  return visit(expression);
}
