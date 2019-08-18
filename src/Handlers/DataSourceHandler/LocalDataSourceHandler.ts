import { Handler } from "../Handlers";

export const localDataSourceHandler: Handler = (props, observables) => {
  if (typeof props.dataSource === "function") return observables;

  let dataSourceObservable = props.dataSource;

  return {
    ...observables,
    datasource: dataSourceObservable
  };
};
