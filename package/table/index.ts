import { withInstall } from "../../src/utils/with-install";
import Component from "./table";
export const Table = withInstall(Component);
export default Table;
export type { TableColumn, SortChange } from "./types";
