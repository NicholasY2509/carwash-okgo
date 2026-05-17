"use strict";
exports.__esModule = true;
exports.DataTable = void 0;
var react_table_1 = require("@tanstack/react-table");
var table_1 = require("@/components/ui/table");
var react_1 = require("react");
function DataTable(_a) {
    var _b;
    var columns = _a.columns, data = _a.data, renderSubComponent = _a.renderSubComponent, getRowCanExpand = _a.getRowCanExpand, getRowId = _a.getRowId;
    var table = react_table_1.useReactTable({
        data: data,
        columns: columns,
        getRowCanExpand: getRowCanExpand,
        getExpandedRowModel: react_table_1.getExpandedRowModel(),
        getCoreRowModel: react_table_1.getCoreRowModel(),
        getRowId: getRowId || (function (row) { var _a; return (_a = row.id) === null || _a === void 0 ? void 0 : _a.toString(); })
    });
    return (react_1["default"].createElement("div", null,
        react_1["default"].createElement("div", { className: "rounded-md border" },
            react_1["default"].createElement(table_1.Table, null,
                react_1["default"].createElement(table_1.TableHeader, null, table.getHeaderGroups().map(function (headerGroup) { return (react_1["default"].createElement(table_1.TableRow, { key: headerGroup.id }, headerGroup.headers.map(function (header) {
                    return (react_1["default"].createElement(table_1.TableHead, { key: header.id }, header.isPlaceholder
                        ? null
                        : react_table_1.flexRender(header.column.columnDef
                            .header, header.getContext())));
                }))); })),
                react_1["default"].createElement(table_1.TableBody, null, ((_b = table.getRowModel().rows) === null || _b === void 0 ? void 0 : _b.length) ? (table.getRowModel().rows.map(function (row) { return (react_1["default"].createElement(react_1["default"].Fragment, { key: row.id },
                    react_1["default"].createElement(table_1.TableRow, { "data-state": row.getIsSelected() && "selected" }, row.getVisibleCells().map(function (cell) { return (react_1["default"].createElement(table_1.TableCell, { key: cell.id }, react_table_1.flexRender(cell.column.columnDef.cell, cell.getContext()))); })),
                    row.getIsExpanded() &&
                        renderSubComponent && (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: row.getVisibleCells()
                                .length }, renderSubComponent({
                            row: row
                        })))))); })) : (react_1["default"].createElement(table_1.TableRow, null,
                    react_1["default"].createElement(table_1.TableCell, { colSpan: columns.length, className: "h-24 text-center" }, "Belum Ada Data Ditambahkan."))))))));
}
exports.DataTable = DataTable;
