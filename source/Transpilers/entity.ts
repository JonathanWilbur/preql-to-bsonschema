import { APIObject, Logger, EntitySpec, APIObjectDatabase, StructSpec } from 'preql-core';
import transpileStruct from './struct';

const transpileEntity = async (obj: APIObject<EntitySpec>, logger: Logger, etcd: APIObjectDatabase): Promise<object> => {
    const rootStruct: APIObject<StructSpec> | undefined = (etcd.kindIndex.struct || [])
        .find((struct: APIObject<StructSpec>): boolean => (
            struct.spec.name === obj.spec.rootStruct
            && struct.spec.databaseName === obj.spec.databaseName
        ));
    if (!rootStruct) {
        throw new Error(`No root struct ''`);
    }

    return await transpileStruct(rootStruct, logger, etcd);
};

export default transpileEntity;
