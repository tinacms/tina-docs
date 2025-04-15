export const addSubpathToSlug = (slug: string, versionNumber: string) => {
  return slug.replace(/^(.+?\/docs\/)/, `$1_versions/${versionNumber}/`);
};
