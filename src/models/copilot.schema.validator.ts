import Ajv from "ajv";
import schema from "./copilot.schema.json";

const copilotAjv = new Ajv();
copilotAjv.addSchema(schema, "copilot");
export const copilotSchemaValidator = copilotAjv;
