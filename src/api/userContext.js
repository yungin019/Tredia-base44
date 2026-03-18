/**
 * Centralized user context builder for TREK AI prompts.
 * Takes a user object from base44.auth.me() and returns a context string.
 */
export function buildUserContext(user) {
  if (!user) return null;

  const { budget_range, risk_tolerance, goal, experience_level } = user;
  if (!budget_range && !risk_tolerance && !goal && !experience_level) return null;

  const lines = ['User profile:'];
  if (budget_range)    lines.push(`- Budget range: ${budget_range}`);
  if (risk_tolerance)  lines.push(`- Risk tolerance: ${risk_tolerance}`);
  if (goal)            lines.push(`- Goal: ${goal}`);
  if (experience_level) lines.push(`- Experience: ${experience_level}`);

  const isNovice     = experience_level === 'Beginner';
  const isLowBudget  = budget_range === 'Under €500' || budget_range === '€500–5k';
  const isAdvanced   = experience_level === 'Advanced';
  const isHighBudget = budget_range === '€50k+' || budget_range === '€5k–50k';

  if (isNovice && isLowBudget) {
    lines.push('- Tone: Use simple, accessible language. Suggest small position sizes. Add clear risk warnings. Be educational and supportive.');
  } else if (isAdvanced && isHighBudget) {
    lines.push('- Tone: Provide deep technical and macro analysis. Assume institutional knowledge. Frame positions at larger scales. Give strategic insight.');
  } else if (isNovice) {
    lines.push('- Tone: Keep language accessible. Include risk context. Guide step by step.');
  } else if (isAdvanced) {
    lines.push('- Tone: Go deep on technicals, macro, and strategy. Skip the basics.');
  }

  lines.push('Adapt all responses accordingly.');
  return lines.join('\n');
}