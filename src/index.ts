import ejs from "ejs";
import { getContext, helpers, Property } from "@dylibso/xtp-bindgen";

function toGolangType(property: Property): string {
  if (property.$ref) return property.$ref.name;

  switch (property.type) {
    case "string":
      return "string";
    case "number":
      return "int64";
    case "integer":
      return "int32";
    case "boolean":
      return "bool";
    case "object":
      return "any";
    case "array":
      if (!property.items) return "[]any";
      // TODO this is not quite right to force cast
      return `[]${toGolangType(property.items as Property)}`;
    case "buffer":
      return "[]byte";
    default:
      throw new Error("Can't convert property to Go type: " + property.type);
  }
}

function pointerToGolangType(property: Property) {
  const typ = toGolangType(property);

  if (typ.startsWith("[]")) {
    return typ;
  }

  return `*${typ}`;
}

// formats multi line comments to fit in block format
function formatGoComment(s: string | null) {
  if (!s) return "";
  return s.trimEnd().replace(/\n/g, " ");
}

// trims comment to fit on one line
function formatGoBlockComment(s: string | null) {
  if (!s) return "";
  return s.trimEnd().replace(/\n/g, "\n// ");
}

function makePublic(s: string) {
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
    toGolangType: toGolangType,
    pointerToGolangType,
    formatGoBlockComment,
    formatGoComment,
    makePublic,
  };

  const output = ejs.render(tmpl, ctx);
  Host.outputString(output);
}
