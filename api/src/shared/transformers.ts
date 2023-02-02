export const booleanTransformer = ({ value }) => {
  if (['true', true, 1, '1'].includes(value)) return true;
  if (['false', false, 0, '0'].includes(value)) return false;
  return value;
};
