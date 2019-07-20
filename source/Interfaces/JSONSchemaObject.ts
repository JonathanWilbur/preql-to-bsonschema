export default
interface JSONSchemaObject {
    type: 'object',
    additionalProperties?: boolean;
    properties?: Record<string, object>;
    required?: string[];
};
