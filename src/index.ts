import ejs from "ejs";
import { getContext, helpers, Property } from "@dylibso/xtp-bindgen";

function toGolangType(property: Property): string {
  if (property.$ref) return property.$ref.name;
  switch (property.type) {
    case "string":
      if (property.format === "date-time") {
        return "time.Time";
      }
      return "string";
    case "number":
      if (property.format === "float") {
        return "float32";
      }
      if (property.format === "double") {
        return "float64";
      }
      return "int64";
    case "integer":
      return "int32";
    case "boolean":
      return "bool";
    case "object":
      return "map[string]interface{}";
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

  if (typ.startsWith("[]") || typ.startsWith("map[")) {
    return typ;
  }

  return `*${typ}`;
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
    toGolangType,
    pointerToGolangType,
    makePublic,
  };

  const output = ejs.render(tmpl, ctx);
  Host.outputString(output);
}
