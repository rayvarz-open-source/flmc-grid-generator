import * as React from 'react';

export const AdvanceFilterContext = React.createContext({
    isDragging: false,
    onDropped: (value: string) => {},
});
