type JsonObject = { [key: string]: any };

function resolveJsonReferences(json: JsonObject): JsonObject {
  const byid: { [id: string]: JsonObject } = {}; 
  const refs: Array<[JsonObject, string, string]> = []; 

  const recurse = (obj: JsonObject, prop: string | null, parent: JsonObject | null): any => {
    if (typeof obj !== 'object' || !obj) {
      return obj;
    }
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (typeof obj[i] !== 'object' || !obj[i]) {
          continue;
        } else if ("$ref" in obj[i]) {
          obj[i] = recurse(obj[i], i.toString(), obj);
        } else {
          obj[i] = recurse(obj[i], null, null);
        }
      }
      return obj;
    }
    if ("$ref" in obj) {
      const ref = obj.$ref;
      if (ref in byid) {
        return byid[ref];
      }
      refs.push([parent!, prop!, ref]);
      return;
    } else if ("$id" in obj) {
      const id = obj.$id;
      delete obj.$id;
      if ("$values" in obj) {
        obj = obj.$values.map(recurse);
      } else {
        for (const prop in obj) {
          obj[prop] = recurse(obj[prop], prop, obj);
        }
      }
      byid[id] = obj;
    }
    return obj;
  };

  json = recurse(json, null, null);

  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    ref[0][ref[1]] = byid[ref[2]];
  }
  return json;
}

export default resolveJsonReferences;