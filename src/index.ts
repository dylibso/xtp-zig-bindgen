import ejs from "ejs";
import { getContext, helpers, Property, XtpSchema } from "@dylibso/xtp-bindgen";

function toZigType(property: Property, pkg?: string): string {
  if (property.$ref) return (pkg ? `${pkg}.` : "") + property.$ref.name;
  switch (property.type) {
    case "string":
      if (property.format === "date-time") {
        return "DateTime";
      }
      return "[]const u8";
    case "number":
      if (property.format === "float") {
        return "f64";
      }
      if (property.format === "double") {
        return "f64";
      }
      return "i64";
    case "integer":
      return "i32";
    case "boolean":
      return "bool";
    case "object":
      return "std.json.ArrayHashMap(std.json.Value)";
    case "array":
      if (!property.items) return "[]std.json.Value";
      // TODO this is not quite right to force cast
      return `[]${toZigType(property.items as Property)}`;
    case "buffer":
      return "[]const u8";
    default:
      throw new Error("Can't convert property to Zig type: " + property.type);
  }
}

function pointerToZigType(property: Property) {
  const typ = toZigType(property);
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

function makeStructName(s: string) {
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
    makeStructName,
    addStdImport,
  };

  const output = ejs.render(tmpl, ctx);
  Host.outputString(output);
}
