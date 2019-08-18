export enum GridCommandName {
  RefreshCurrentPage = "RefreshCurrentPage",
  SetCurrentPage = "SetCurrentPage",
  Nop = "Nop"
}

export type GridCommand = {
  name: GridCommandName;
  param?: any;
};

export const GridCommands = {
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
