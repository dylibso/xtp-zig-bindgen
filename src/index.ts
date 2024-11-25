import ejs from "ejs";
import {
  ArrayType,
  EnumType,
  getContext,
  helpers,
  ObjectType,
  XtpNormalizedType,
  XtpSchema,
} from "@dylibso/xtp-bindgen";

function toZigType(type: XtpNormalizedType, pkg?: string): string {
  switch (type.kind) {
    case "date-time":
      return "DateTime";
    case "string":
      return "[]const u8";
    case "float":
      return "f64";
    case "double":
      return "f64";
    case "int32":
      return "i32";
    case "int64":
      return "i64";
    case "boolean":
      return "bool";
    case "buffer":
      return "[]const u8";
    case "byte":
      return "u8";

    case "object":
      const oType = type as ObjectType;
      if (oType.properties?.length > 0) {
        return (pkg ? `${pkg}.` : "") + zigTypeName(oType.name);
      }
      return "std.json.ArrayHashMap(std.json.Value)";

    case "array":
      const arrayType = type as ArrayType;
      if (!arrayType.elementType) {
        return "[]std.json.Value";
      }
      return `[]${toZigType(arrayType.elementType)}`;

    case "enum":
      const eType = type as EnumType;
      return zigTypeName(eType.name);

    default:
      throw new Error("Can't convert property to Zig type: " + type.kind);
  }
}

function pointerToZigType(type: XtpNormalizedType) {
  const typ = toZigType(type);
  return `*${typ}`;
}

function addStdImport(schema: XtpSchema) {
  // in the generated `main.zig` this would include a reference to
  // std.json.ArrayHashMap and std.json.Value, so we import "std".
  const exportHasJsonObject = schema.exports.some((f) => {
    return (f.input?.contentType === "application/json" &&
      f.input.type === "object") ||
      (f.output?.contentType === "application/json" &&
        f.output.type === "object");
  });

  return exportHasJsonObject /* || others here */
    ? 'const std = @import("std");'
    : null;
}

function zigFuncName(s: string) {
  return helpers.snakeToCamelCase(s);
}

function zigVarName(s: string) {
  return helpers.camelToSnakeCase(s);
}

function zigTypeName(s: string) {
  s = helpers.snakeToCamelCase(s);
  const cap = s.charAt(0).toUpperCase();
  if (s.charAt(0) === cap) {
    return s;
  }

  const pub = cap + s.slice(1);
  return pub;
}

export function render() {
  const tmpl = Host.inputString();
  const ctx = {
    ...helpers,
    ...getContext(),
    toZigType,
    pointerToZigType,
    addStdImport,
    zigTypeName,
    zigFuncName,
    zigVarName,
  };

  const output = ejs.render(tmpl, ctx);
  Host.outputString(output);
}
