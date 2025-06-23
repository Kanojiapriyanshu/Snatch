/**
 * Clean AI JSON: remove "considerations:" from values and sync with `considerations` block.
 * Also extract bracketed suggestions as yellow warnings.
 * 
 * @param {object} data - The JSON returned by your AI
 * @param {string[]} fieldsToCheck - Which fields may have considerations prefix
 * @returns {object} - Cleaned JSON with no prefixes in fields
 */
export function cleanAIResponse(data, fieldsToCheck = ['companyLocation', 'eventName', 'titleName', 'description']) {
  const cleaned = { ...data };
  cleaned.considerations = cleaned.considerations || {};

  fieldsToCheck.forEach((field) => {
    const value = cleaned[field];
    if (typeof value === 'string') {
      // Check for bracketed suggestion
      const bracketMatch = value.match(/^(.*?)\s*\((.*?)\)$/);
      if (bracketMatch) {
        cleaned[field] = bracketMatch[1].trim();
        cleaned.considerations[field] = bracketMatch[2].trim();
        cleaned.considerations[`${field}_type`] = 'yellow'; // Mark as yellow
      } else if (value.trim().toLowerCase().startsWith('considerations:')) {
        const question = value.replace(/^considerations:\s*/i, '').trim();
        cleaned.considerations[field] = question;
        cleaned.considerations[`${field}_type`] = 'red'; // Mark as red
        cleaned[field] = '';
      }
    }
  });

  return cleaned;
}