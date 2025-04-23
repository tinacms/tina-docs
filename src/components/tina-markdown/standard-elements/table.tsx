import { TinaMarkdown } from "tinacms/dist/rich-text";
import DocsMDXComponentRenderer from "../markdown-component-mapping";

export const Table = (props) => {
  // Navigate through the nested structure to find the actual table content
  const tableRows = props?.children?.props?.children || [];

  return (
    <div className="my-6 overflow-x-auto rounded-lg shadow-md">
      <table className="w-full table-auto">
        <tbody>
          {tableRows.map((row, rowIndex) => {
            // Each row has its own props.children array containing cells
            const cells = row?.props?.children || [];
            const CellComponent = rowIndex === 0 ? "th" : "td";

            return (
              <tr
                key={`row-${rowIndex}`}
                className={rowIndex % 2 === 0 ? "bg-white/5" : "bg-blue-500/5"}
              >
                {cells.map((cell, cellIndex) => {
                  return (
                    <CellComponent
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className={`border border-orange-100 px-4 py-2 ${
                        rowIndex === 0
                          ? "bg-white/50 text-left font-tuner font-normal text-orange-500"
                          : ""
                      } ${cellIndex === 0 ? "max-w-xs break-words" : ""}`}
                    >
                      {cell?.props?.children}
                      <TinaMarkdown
                        content={cell?.props?.content as any}
                        components={DocsMDXComponentRenderer}
                      />
                    </CellComponent>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
