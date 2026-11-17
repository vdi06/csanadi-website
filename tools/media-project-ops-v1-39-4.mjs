/* Csanádi v1.39.4 – a böngészős médiakezelő tiszta, tesztelhető műveletei.
   Nincsenek hálózati vagy fájlrendszeri mellékhatásaik. */

export function replaceAssetReferences(value, replacements) {
  if (typeof value === 'string') {
    return replacements.reduce((result, [from, to]) => result.split(from).join(to), value);
  }
  if (Array.isArray(value)) return value.map(item => replaceAssetReferences(item, replacements));
  if (value && typeof value === 'object') {
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      const changedKey = replaceAssetReferences(key, replacements);
      if (Object.hasOwn(output, changedKey)) throw Error('Ütköző JSON-kulcs fájlátnevezés után: ' + changedKey);
      output[changedKey] = replaceAssetReferences(item, replacements);
    }
    return output;
  }
  return value;
}

export function removeAssetEntries(value, assetPath, mediaId) {
  const pointsToAsset = row => row && typeof row === 'object' &&
    (row.src === assetPath || row.filePath === assetPath ||
     row.original?.path === assetPath || row.path === assetPath ||
     (mediaId && row.id === mediaId));
  if (Array.isArray(value)) return value.filter(row => !pointsToAsset(row))
    .map(row => removeAssetEntries(row, assetPath, mediaId));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) =>
      [key, removeAssetEntries(item, assetPath, mediaId)]));
  }
  return value;
}

export function containsReference(value, reference) {
  if (!reference) return false;
  if (typeof value === 'string') return value.includes(reference);
  if (Array.isArray(value)) return value.some(row => containsReference(row, reference));
  return !!value && typeof value === 'object' && Object.entries(value)
    .some(([key, item]) => key.includes(reference) || containsReference(item, reference));
}

export function uniqueMediaId(prefix, assetPath, occupiedIds) {
  const stem = assetPath.split('/').at(-1).replace(/\.[^.]+$/, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().slice(0, 48);
  let hash = 2166136261;
  for (const character of assetPath) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const base = `${prefix}:local-${stem}-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  let id = base, suffix = 2;
  while (occupiedIds.has(id)) id = `${base}-${suffix++}`;
  return id;
}
