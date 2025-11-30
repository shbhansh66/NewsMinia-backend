const getCategoryWithoutAI = (title) => {
    const lower = title.toLowerCase();

    if (lower.includes('stock') || lower.includes('market') || lower.includes('business') || lower.includes('finance'))
        return 'Business';
    if (lower.includes('politic') || lower.includes('election') || lower.includes('government'))
        return 'Politics';
    if (lower.includes('cricket') || lower.includes('sport') || lower.includes('football'))
        return 'Sports';
    if (lower.includes('tech') || lower.includes('software') || lower.includes('ai') || lower.includes('gadget'))
        return 'Technology';
    if (lower.includes('science') || lower.includes('space') || lower.includes('research'))
        return 'Science';
    if (lower.includes('world') || lower.includes('global') || lower.includes('international'))
        return 'World';
    if (lower.includes('india') || lower.includes('delhi') || lower.includes('mumbai') || lower.includes('indian'))
        return 'India';

    return 'Miscellaneous';
};

module.exports = getCategoryWithoutAI;
