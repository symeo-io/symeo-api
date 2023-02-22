export const EnvironmentColors = [
  'amber',
  'blue',
  'blueGrey',
  'brown',
  'cyan',
  'deepOrange',
  'deepPurple',
  'green',
  'grey',
  'indigo',
  'lightBlue',
  'lightGreen',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
] as const;

export type EnvironmentColor = (typeof EnvironmentColors)[number];
