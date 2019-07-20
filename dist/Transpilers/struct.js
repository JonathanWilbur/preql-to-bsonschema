"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var attribute_1 = __importDefault(require("./attribute"));
var transpileStruct = function (obj, logger, etcd) { return __awaiter(_this, void 0, void 0, function () {
    var ret;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ret = {
                    title: obj.spec.name,
                    additionalProperties: false,
                    required: [],
                    properties: {},
                };
                return [4 /*yield*/, Promise.all((etcd.kindIndex.attribute || [])
                        .filter(function (attr) { return (attr.spec.structName === obj.spec.name
                        && attr.spec.databaseName === obj.spec.databaseName); })
                        .map(function (attr) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = ret.properties;
                                    _b = attr.spec.name;
                                    return [4 /*yield*/, attribute_1.default(attr, logger, etcd)];
                                case 1:
                                    _a[_b] = _c.sent();
                                    if (attr.spec.nullable === false) {
                                        ret.required.push(attr.spec.name);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                _a.sent();
                /**
                 * The reason you use the FKs instead of just filtering all structs within
                 * the database is that you cannot be sure that all structs directly link
                 * to the current struct. For example, B might have an FK on A, and C an
                 * FK on B, but C might not have an FK on A.
                 */
                return [4 /*yield*/, Promise.all((etcd.kindIndex.foreignkey || []) // Get foreign keys
                        // ...in which this is the parent (so we can get children)
                        .filter(function (fk) { return (fk.spec.databaseName === obj.spec.databaseName
                        && fk.spec.parentStructName === obj.spec.name); })
                        // Then, get the associated child structs.
                        .map(function (fk) {
                        var struct = etcd.kindIndex.struct.find(function (struct) { return (struct.spec.databaseName === obj.spec.databaseName
                            && struct.spec.name === fk.spec.childStructName); });
                        if (!struct) {
                            throw new Error("Struct '" + fk.spec.childStructName + "' not found.");
                        }
                        return [struct, fk];
                    })
                        // Then add the fields for each child struct.
                        .map(function (structAndFK) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    if (!(structAndFK[0].spec.entityName === obj.spec.entityName)) return [3 /*break*/, 2];
                                    _a = ret.properties;
                                    _b = structAndFK[0].spec.name;
                                    _c = {
                                        type: 'array'
                                    };
                                    return [4 /*yield*/, transpileStruct(structAndFK[0], logger, etcd)];
                                case 1:
                                    _a[_b] = (_c.items = _d.sent(),
                                        _c);
                                    return [3 /*break*/, 3];
                                case 2:
                                    ret.properties[structAndFK[0].spec.name] = {
                                        type: 'array',
                                        items: {
                                            type: 'objectId',
                                        },
                                    };
                                    _d.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 2:
                /**
                 * The reason you use the FKs instead of just filtering all structs within
                 * the database is that you cannot be sure that all structs directly link
                 * to the current struct. For example, B might have an FK on A, and C an
                 * FK on B, but C might not have an FK on A.
                 */
                _a.sent();
                /**
                 * The reason you use the FKs instead of just filtering all structs within
                 * the database is that you cannot be sure that all structs directly link
                 * to the current struct. For example, B might have an FK on A, and C an
                 * FK on B, but C might not have an FK on A.
                 */
                return [4 /*yield*/, Promise.all((etcd.kindIndex.foreignkey || []) // Get foreign keys
                        // ...in which this is the child (so we can get parents)
                        .filter(function (fk) { return (fk.spec.databaseName === obj.spec.databaseName
                        && fk.spec.childStructName === obj.spec.name // REVIEW
                    ); })
                        // Then, get the associated parent structs.
                        .map(function (fk) {
                        var struct = etcd.kindIndex.struct.find(function (struct) { return (struct.spec.databaseName === obj.spec.databaseName
                            && struct.spec.name === fk.spec.parentStructName); });
                        if (!struct) {
                            throw new Error("Struct '" + fk.spec.parentStructName + "' not found.");
                        }
                        return [struct, fk];
                    })
                        // Then add the fields for each parent struct.
                        .map(function (structAndFK) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            /**
                             * Nothing needs to be done if the parent struct and the child
                             * struct are within the same entity, because, by virtue of the
                             * recursion used in this library, the child struct will already
                             * be added to the parent struct in the entity if they are in the
                             * same entity.
                             */
                            if (structAndFK[0].spec.entityName !== obj.spec.entityName) {
                                ret.properties[structAndFK[0].spec.name] = {
                                    type: 'objectId',
                                };
                            }
                            if (structAndFK[1].spec.nullable === false) {
                                ret.required.push(structAndFK[0].spec.name);
                            }
                            return [2 /*return*/];
                        });
                    }); }))];
            case 3:
                /**
                 * The reason you use the FKs instead of just filtering all structs within
                 * the database is that you cannot be sure that all structs directly link
                 * to the current struct. For example, B might have an FK on A, and C an
                 * FK on B, but C might not have an FK on A.
                 */
                _a.sent();
                return [2 /*return*/, ret];
        }
    });
}); };
exports.default = transpileStruct;
