"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var react_1 = require("@inertiajs/react");
var axios_1 = require("axios");
var react_2 = require("react");
var sonner_1 = require("sonner");
var StaffForm = react_2.forwardRef(function (_a, ref) {
    var onSuccess = _a.onSuccess, onCancel = _a.onCancel, staff = _a.staff;
    var isEditMode = !!staff;
    var formRef = react_2.useRef(null);
    var _b = react_2.useState([]), workPositions = _b[0], setWorkPositions = _b[1];
    var _c = react_2.useState([]), users = _c[0], setUsers = _c[1];
    var _d = react_2.useState(true), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useForm({
        nik: "Auto-Generate",
        first_name: "",
        last_name: "",
        phone: "",
        work_position_id: "",
        user_id: ""
    }), data = _e.data, setData = _e.setData, post = _e.post, patch = _e.patch, processing = _e.processing, errors = _e.errors, reset = _e.reset;
    react_2.useEffect(function () {
        if (isEditMode && staff) {
            setData({
                nik: staff.nik || "Auto-Generate",
                first_name: staff.first_name || "",
                last_name: staff.last_name || "",
                phone: staff.phone || "",
                work_position_id: String(staff.work_position_id || ""),
                user_id: String(staff.user_id || "")
            });
        }
        else {
            reset();
        }
    }, [staff]);
    react_2.useImperativeHandle(ref, function () { return ({
        submit: function () {
            var _a;
            (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.requestSubmit();
        }
    }); });
    function handleSubmit(e) {
        e.preventDefault();
        var handleSuccess = function () {
            sonner_1.toast.success("Staff telah berhasil " + (isEditMode ? "diperbarui" : "ditambahkan") + ".");
            onSuccess();
        };
        if (isEditMode) {
            if (!staff)
                return;
            patch(route("staffs.update", staff.id), {
                onSuccess: handleSuccess
            });
        }
        else {
            post(route("staffs.store"), {
                onSuccess: function () {
                    reset();
                    handleSuccess();
                }
            });
        }
    }
    var handleWorkPositionChange = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setData("work_position_id", value);
                    if (isEditMode)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1["default"].get("/api/generate-nik/" + value)];
                case 2:
                    response = _a.sent();
                    setData("nik", response.data.nik);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to generate NIK", error_1);
                    setData("nik", "Auto-Generate");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    react_2.useEffect(function () {
        setLoading(true);
        axios_1["default"]
            .get(route("staffs.meta"))
            .then(function (response) {
            setWorkPositions(response.data.work_positions);
            setUsers(response.data.users);
        })["catch"](function (error) {
            console.error("Error fetching staff meta:", error);
        })["finally"](function () {
            setLoading(false);
        });
    }, []);
    if (loading) {
        return react_2["default"].createElement("div", { className: "p-6 text-center" }, "Loading...");
    }
    return (react_2["default"].createElement("form", { ref: formRef, onSubmit: handleSubmit, className: "py-4 space-y-4 px-4" },
        react_2["default"].createElement("div", null,
            react_2["default"].createElement(label_1.Label, { htmlFor: "nik" }, "NIK (Nomor Induk Karyawan)"),
            react_2["default"].createElement(input_1.Input, { id: "nik", type: "text", value: data.nik, readOnly: true, className: "mt-1" }),
            errors.nik && (react_2["default"].createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.nik))),
        react_2["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "first_name" }, "Nama Depan"),
                react_2["default"].createElement(input_1.Input, { id: "first_name", type: "text", value: data.first_name, onChange: function (e) {
                        return setData("first_name", e.target.value);
                    }, className: "mt-1", required: true }),
                errors.first_name && (react_2["default"].createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.first_name))),
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "last_name" }, "Nama Belakang"),
                react_2["default"].createElement(input_1.Input, { id: "last_name", type: "text", value: data.last_name, onChange: function (e) {
                        return setData("last_name", e.target.value);
                    }, className: "mt-1" }),
                errors.last_name && (react_2["default"].createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.last_name)))),
        react_2["default"].createElement("div", null,
            react_2["default"].createElement(label_1.Label, { htmlFor: "phone" }, "No. Telepon"),
            react_2["default"].createElement(input_1.Input, { id: "phone", type: "text", value: data.phone, onChange: function (e) { return setData("phone", e.target.value); }, className: "mt-1" }),
            errors.phone && (react_2["default"].createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.phone))),
        react_2["default"].createElement("div", null,
            react_2["default"].createElement(label_1.Label, { htmlFor: "work_position_id" }, "Posisi Kerja"),
            react_2["default"].createElement(select_1.Select, { value: String(data.work_position_id), onValueChange: handleWorkPositionChange, required: true },
                react_2["default"].createElement(select_1.SelectTrigger, { className: "mt-1" },
                    react_2["default"].createElement(select_1.SelectValue, { placeholder: "Pilih posisi kerja" })),
                react_2["default"].createElement(select_1.SelectContent, null, workPositions.map(function (pos) { return (react_2["default"].createElement(select_1.SelectItem, { key: pos.id, value: String(pos.id) }, pos.name)); }))),
            errors.work_position_id && (react_2["default"].createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.work_position_id))),
        react_2["default"].createElement("div", null,
            react_2["default"].createElement(label_1.Label, { htmlFor: "user_id" }, "Akun User (Untuk Login)"),
            react_2["default"].createElement(select_1.Select, { value: String(data.user_id), onValueChange: function (value) { return setData("user_id", value); } },
                react_2["default"].createElement(select_1.SelectTrigger, { className: "mt-1" },
                    react_2["default"].createElement(select_1.SelectValue, { placeholder: "Pilih akun user atau biarkan kosong" })),
                react_2["default"].createElement(select_1.SelectContent, null, users.map(function (user) { return (react_2["default"].createElement(select_1.SelectItem, { key: user.id, value: String(user.id) },
                    user.name,
                    " - (",
                    user.email,
                    ")")); }))),
            errors.user_id && (react_2["default"].createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.user_id)))));
});
exports["default"] = StaffForm;
