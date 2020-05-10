export const handleInputChange = (set:any) => (e:any) => set(e.target.value);

export const stopPropagation = (f:any) => (e:any) => {
  e.stopPropagation();
  f();
};