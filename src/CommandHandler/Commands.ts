export enum GridCommandName {
  RefreshCurrentPage = "RefreshCurrentPage",
  SetCurrentPage = "SetCurrentPage",
  Nop = "Nop"
}

export type GridCommand = {
  name: GridCommandName;
  param?: any;
};

export const GridCommands: { [key: string]: GridCommand | ((...args: any[]) => GridCommand) } = {
  refresh: {
    name: GridCommandName.RefreshCurrentPage
  },
  setCurrentPage: (pageNo: number) => {
    return {
      name: GridCommandName.SetCurrentPage,
      param: pageNo
    };
  },
  nop: { name: GridCommandName.Nop }
};

export type Command = GridCommand;
