import { APIObject, Logger, AttributeSpec, DataTypeSpec, APIObjectDatabase } from 'preql-core';

const transpileAttribute = async (obj: APIObject<AttributeSpec>, logger: Logger, etcd: APIObjectDatabase): Promise<object> => {
    const ret: any = {};
    const dataType: APIObject<DataTypeSpec> | undefined = etcd.kindNameIndex[`datatype:${obj.spec.type}`];
    if (!dataType) {
        throw new Error(`No data type named '${obj.spec.type}'.`);
    }
    const bsonDataType: string | undefined = ((): string | undefined => {
        if (dataType.spec.values) return 'string';
        if (
            ('bson' in dataType.spec.targets)
            && ('return' in dataType.spec.targets['bson'])
            && (typeof dataType.spec.targets['bson'].nativeType === 'string')
        ) {
            return dataType.spec.targets['bson'].nativeType;
        }
        if (dataType.spec.jsonEquivalent) {
            return dataType.spec.jsonEquivalent;
        }
    })();

    if (bsonDataType) {
        ret.type = bsonDataType;
    }

    if (dataType.spec.jsonEquivalent === 'number') {
        if (dataType.spec.minimum) {
            ret.minimum = dataType.spec.minimum;
        }
        if (dataType.spec.maximum) {
            ret.maximum = dataType.spec.maximum;
        }
    }

    // if (dataType.spec.jsonEquivalent === 'string') {
    //     if (dataType.spec.regexes && 'pcre' in dataType.spec.regexes) {
    //         Object.keys(dataType.spec.regexes.pcre)
    //     }
    // }

    if (obj.spec.multiValued) {
        ret.type = 'array';
        ret.items = {
            type: bsonDataType,
        };
    }
    return ret;
};

export default transpileAttribute;
