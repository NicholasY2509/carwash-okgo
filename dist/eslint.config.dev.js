"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _js = _interopRequireDefault(require("@eslint/js"));

var _eslintConfigPrettier = _interopRequireDefault(require("eslint-config-prettier"));

var _eslintPluginReact = _interopRequireDefault(require("eslint-plugin-react"));

var _eslintPluginReactHooks = _interopRequireDefault(require("eslint-plugin-react-hooks"));

var _globals = _interopRequireDefault(require("globals"));

var _typescriptEslint = _interopRequireDefault(require("typescript-eslint"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/** @type {import('eslint').Linter.Config[]} */
var _default = [_js["default"].configs.recommended].concat(_toConsumableArray(_typescriptEslint["default"].configs.recommended), [_objectSpread({}, _eslintPluginReact["default"].configs.flat.recommended, {}, _eslintPluginReact["default"].configs.flat["jsx-runtime"], {
  languageOptions: {
    globals: _objectSpread({}, _globals["default"].browser)
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off"
  },
  settings: {
    react: {
      version: "detect"
    }
  }
}), {
  plugins: {
    "react-hooks": _eslintPluginReactHooks["default"]
  },
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}, {
  ignores: ["vendor", "node_modules", "public", "bootstrap/ssr", "tailwind.config.js"]
}, _eslintConfigPrettier["default"]]);

exports["default"] = _default;