import { TinaMarkdown } from "tinacms/dist/rich-text";
import DocsMDXComponentRenderer from "../markdown-component-mapping";

export const Table = (props) => {
  // Navigate through the nested structure to find the actual table content
  const tableRows = props?.children?.props?.children || [];
  const rowCount = tableRows.length;

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
                className={"bg-neutral-background-secondary/50"}
              >
                {cells.map((cell, cellIndex) => {
                  return (
                    <CellComponent
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className={` px-4 pt-2 ${
                        rowIndex === 0
                          ? " text-left font-tuner bg-neutral-background-secondary  border-b-[0.5px] border-neutral-border "
                          : ""
                      } ${cellIndex === 0 ? "max-w-xs break-words" : ""}
                      ${
                        rowIndex === 0 || rowIndex === rowCount - 1
                          ? ""
                          : "border-b border-neutral-border"
                      }
                      `}
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
