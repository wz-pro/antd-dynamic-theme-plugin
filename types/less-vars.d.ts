declare function lessVars(filePath: string): Promise<{
  [key: string]: string;
}>;
export default lessVars;
